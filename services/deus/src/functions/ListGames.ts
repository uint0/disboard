import { app } from "@azure/functions";
import httpHandler from "../framework/web";
import { AzureHttpRequestContext, HttpRequest, HttpResponse } from "../framework/web/types";
import GameInstanceManager from "../components/gameInstance";
import { response } from "../framework/web/response";
import { ShortGameInstance } from "./models";

type GamesList = {
    games: Game[];
};

type Game = {
    game: string;
    instances: ShortGameInstance[];
};

async function listGames(req: HttpRequest, _: AzureHttpRequestContext): Promise<HttpResponse<GamesList>> {
    const gameInstances = await GameInstanceManager.list();
    const games: Record<string, ShortGameInstance[]> = {};

    for (const game of gameInstances) {
        const shortGameInstance = { game: game.game, instance: game.instance };
        if (games[game.game] === undefined) {
            games[game.game] = [shortGameInstance];
        } else {
            games[game.game].push(shortGameInstance);
        }
    }

    return response.ok({
        games: Object.entries(games).map(([gameName, gameInstances]) => ({
            game: gameName,
            instances: gameInstances,
        })),
    });
}

app.get("ListGames", {
    route: "v1/game",
    authLevel: "anonymous",
    handler: httpHandler({
        handler: listGames,
    }),
});
