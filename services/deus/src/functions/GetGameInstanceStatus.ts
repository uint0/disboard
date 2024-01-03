import { app } from "@azure/functions";
import httpHandler from "../framework/web";
import { response } from "../framework/web/response";
import { AzureHttpRequestContext, HttpErrorBody, HttpRequest, HttpResponse, WithPath } from "../framework/web/types";
import GameInstanceManager from "../components/gameInstance";
import { GameInstancePath, TGameInstancePath } from "./models";

async function getGameInstanceStatus(
    req: HttpRequest & WithPath<TGameInstancePath>,
    _: AzureHttpRequestContext,
): Promise<HttpResponse<HttpErrorBody | { status: string }>> {
    const { game, instance } = req.path;

    const gameInstance = await GameInstanceManager.find(game, instance);
    if (gameInstance === null) {
        return response.notFound({
            error: `game instance ${game}/${instance} not found or does not have tagged compute component`,
        });
    }

    return response.ok({
        status: await gameInstance.getEffectiveStatus(),
    });
}

app.get("GetGameInstanceStatus", {
    route: "v1/game/{game}/{instance}/status",
    authLevel: "anonymous",
    handler: httpHandler({
        path: GameInstancePath,
        handler: getGameInstanceStatus,
    }),
});
