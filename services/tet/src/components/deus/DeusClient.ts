import { GameInstance } from "../../types/deus";

export type GameInstanceStatus = "Running" | "Stopped";

export type DeusResponse<TOk, TErr = { error: string }> = { response: TOk } | { error: TErr };

export type SetGameInstanceStatusOpts = {
    transitionPolicy?: "Restart";
};

export type SetGameInstanceStatusResponse = {
    previousStatus: GameInstanceStatus;
};

export type GetGameInstanceStatusResponse = {
    status: GameInstanceStatus;
};

export type GetGameInstanceResponse = {
    game: string;
    instance: string;
    status: string;
};

export type ListInstancesForGameResponse = {
    instances: { game: string; instance: string }[];
};

export type ListGameInstancesResponse = {
    games: {
        game: string;
        instances: { game: string; instance: string }[];
    }[];
};

export default class DeusClient {
    constructor(private baseUrl: string) {}

    async setGameInstanceStatus(
        gameInstance: GameInstance,
        status: GameInstanceStatus,
        options: SetGameInstanceStatusOpts = {},
    ): Promise<DeusResponse<SetGameInstanceStatusResponse>> {
        const resp = await fetch(`${this.baseUrl}/api/v1/game/${gameInstance.game}/${gameInstance.instance}/status`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                status,
                ...(options.transitionPolicy !== undefined ? { transitionPolicy: options.transitionPolicy } : {}),
            }),
        });
        if (!resp.ok) {
            return { error: await resp.json() };
        } else {
            return { response: await resp.json() };
        }
    }

    async getGameInstanceStatus(gameInstance: GameInstance): Promise<DeusResponse<GetGameInstanceStatusResponse>> {
        const resp = await fetch(`${this.baseUrl}/api/v1/game/${gameInstance.game}/${gameInstance.instance}/status`);
        if (!resp.ok) {
            return { error: await resp.json() };
        } else {
            return { response: await resp.json() };
        }
    }

    async getGameInstance(gameInstance: GameInstance): Promise<DeusResponse<GetGameInstanceResponse>> {
        const resp = await fetch(`${this.baseUrl}/api/v1/game/${gameInstance.game}/${gameInstance.instance}`);
        if (!resp.ok) {
            return { error: await resp.json() };
        } else {
            return { response: await resp.json() };
        }
    }

    async listInstancesForGame(game: string): Promise<DeusResponse<ListInstancesForGameResponse>> {
        const resp = await fetch(`${this.baseUrl}/api/v1/game/${game}`);
        if (!resp.ok) {
            return { error: await resp.json() };
        } else {
            return { response: await resp.json() };
        }
    }

    async listGameInstances(): Promise<DeusResponse<ListGameInstancesResponse>> {
        const resp = await fetch(`${this.baseUrl}/api/v1/game`);
        if (!resp.ok) {
            return { error: await resp.json() };
        } else {
            return { response: await resp.json() };
        }
    }
}
