import { app } from "@azure/functions";
import httpHandler from "../framework/web";
import { GameInstancePath, TGameInstancePath } from "./models";
import { AzureHttpRequestContext, HttpRequest, HttpResponse, WithPath } from "../framework/web/types";
import GameInstanceManager from "../components/gameInstance";
import { response } from "../framework/web/response";

type GameInstanceInfo = {
    game: string;
    instance: string;
    status: string;
};

async function getGameInstance(
    req: HttpRequest & WithPath<TGameInstancePath>,
    _: AzureHttpRequestContext,
): Promise<HttpResponse<GameInstanceInfo[]>> {
    const { game, instance } = req.path;

    const gameInstance = await GameInstanceManager.find(game, instance);
    if (gameInstance === null) {
        return response.notFound({
            error: `game instance ${game}/${instance} not found or does not have tagged compute component`,
        });
    }

    return response.ok({
        game: gameInstance.game,
        instance: gameInstance.instance,
        status: await gameInstance.getEffectiveStatus(),
    });
}

app.get("GetGameInstance", {
    route: "v1/game/{game}/{instance}",
    authLevel: "anonymous",
    handler: httpHandler({
        path: GameInstancePath,
        handler: getGameInstance,
    }),
});
