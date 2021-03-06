from collections import namedtuple
import datetime as dt
import asyncio
import logging

import config
import handlers.server.exceptions as exceptions
import handlers.server.ServerManager as ServerManager

IOTA = 2

SERVER_DEALLOCATED = 'PowerState/deallocated'
SERVER_RUNNING = 'PowerState/running'
TERMINAL_STATUSES = set([SERVER_DEALLOCATED, SERVER_RUNNING])

ServerStatus = namedtuple('ServerStatus', ['status_code', 'status_name', 'status_time'])
ServerNames  = namedtuple('ServerNames', ['name', 'group'])

logger = logging.getLogger(__name__)

def requires_perm(perm):
    def decorator(func):
        def wrapper(self, *args, **kwargs):
            if perm not in self._perms:
                raise exceptions.ServerForbiddenException(
                    f"Required perm {perm} was not in found in allowed perms for this server"
                )
            return func(self, *args, **kwargs)
        return wrapper
    return decorator


class Server:
    def __init__(self, vm_name):
        server_info = config.server.get_server(vm_name)
        if server_info is None:
            raise exceptions.ServerNotConfiguredException(f"Could not find {vm_name} or alias")

        self._called_name = vm_name
        self._server_info = server_info
        self._resource    = server_info['resource']
        self._meta        = server_info['meta']
        self._perms       = set(server_info['perms'])

        self._manager = ServerManager.ServerManager(self._resource['name'], self._resource['group'])
    
    def __str__(self):
        return self.name

    @property
    def resource_names(self):
        return ServerNames(
            name=self._resource['name'],
            group=self._resource['group']
        )
    
    @property
    def meta(self):
        return self._meta.copy()
    
    @property
    def name(self):
        return self._server_info['name']
    
    @property
    def called_name(self):
        return self._called_name

    @requires_perm('read')
    async def get_status(self):
        instance_view = await self._manager.get_vm_instance_view()
        statuses = instance_view.statuses
        provision_status = statuses[0]
        power_status = statuses[1]

        return ServerStatus(
            status_code=power_status.code,
            status_name=power_status.display_status,
            status_time=dt.datetime.now(dt.timezone.utc) - provision_status.time if provision_status.time else None
        )

    @requires_perm('power')
    async def start(self):
        return await self._manager.start()
    
    @requires_perm('power')
    async def stop(self):
        return await self._manager.stop()
    
    async def close(self):
        return await self._manager.close()
