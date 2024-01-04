locals {
  tet_default_tags = {
    disboard_component = "tet"
  }
}

resource "azurerm_resource_group" "tet" {
  name     = "tet"
  location = local.default_workload_location
  tags     = local.tet_default_tags
}

resource "azurerm_role_definition" "tet_execution_role" {
  name        = "tet-queue-writer"
  scope       = azurerm_resource_group.tet.id
  description = "Allows tet to interact with its work queues"

  permissions {
    actions = [
      "Microsoft.Storage/storageAccounts/listkeys/action",
      "Microsoft.Storage/storageAccounts/queueServices/read",
      "Microsoft.Storage/storageAccounts/queueServices/write",
    ]
  }

  assignable_scopes = [azurerm_resource_group.tet.id]
}

module "tet_function" {
  source = "./modules/node-function-app"

  name                = "tet"
  location            = local.default_workload_location
  resource_group_name = azurerm_resource_group.tet.name
  app_settings = {
    DISCORD_BOT_PUBLIC_KEY                       = var.tet_discord_bot_public_key
    TET_DISCORD_DEFERRED_QUEUE_NAME              = azurerm_storage_queue.tet_discord_deferred.name
    TET_DISCORD_DEFERRED_QUEUE_CONNECTION_STRING = module.tet_function.storage.primary_connection_string # this is cursed
    DEUS_BASE_URL                                = module.deus_function.function.url
  }
  role = {
    id    = azurerm_role_definition.tet_execution_role.role_definition_resource_id
    scope = azurerm_resource_group.tet.id
  }
}

resource "azurerm_storage_queue" "tet_discord_deferred" {
  name                 = "discord-deferred"
  storage_account_name = module.tet_function.storage.name
  metadata             = local.tet_default_tags
}
