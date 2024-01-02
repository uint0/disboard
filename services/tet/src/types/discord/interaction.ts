import { CommandData } from "./command";

export enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND = 2,
}

export type InteractionPingRequest = {
    type: InteractionType.PING;
};

export type InteractionApplicationCommandRequest = {
    application_id: string;
    type: InteractionType.APPLICATION_COMMAND;
    token: string;
    data: CommandData;
};

export type InteractionRequest = {
    id: string;
} & (InteractionPingRequest | InteractionApplicationCommandRequest);

export enum InteractionCallbackType {
    PONG = 1,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
}

export type InteractionPongResponse = {
    type: InteractionCallbackType.PONG;
};

export type InteractionDeferredMessageResponse = {
    type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
};

export type InteractionAutocompleteResponse = {
    type: InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT;
    data: {
        choices: { name: string; name_locationlizations?: Record<string, string>; value: string | number }[];
    };
};

export type InteractionResponse =
    | InteractionPongResponse
    | InteractionDeferredMessageResponse
    | InteractionAutocompleteResponse;
