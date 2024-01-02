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
}
