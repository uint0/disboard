import { envOrFatal } from "./_util";

export const DISCORD_DEFERRED_QUEUE_NAME = envOrFatal("TET_DISCORD_DEFERRED_QUEUE_NAME");
export const DISCORD_DEFERRED_CONN_STR_CONF_KEY = "TET_DISCORD_DEFERRED_QUEUE_CONNECTION_STRING";
export const DISCORD_DEFERRED_CONN_STR = envOrFatal(DISCORD_DEFERRED_CONN_STR_CONF_KEY);