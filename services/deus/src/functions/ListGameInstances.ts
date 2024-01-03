import { app } from "@azure/functions";
import GameInstanceManager from "../components/gameInstance";
import { response } from "../framework/web/response";
import { AzureHttpRequestContext, HttpRequest, HttpResponse, WithPath } from "../framework/web/types";
import httpHandler from "../framework/web";
import { Type, type Static } from "@sinclair/typebox";
import { ShortGameInstance } from "./models";

type ListGameInstanceResponse = {
    instances: ShortGameInstance[];
};

const ListGameInstanceParams = Type.Object({
    game: Type.String(),
});
type TListGameInstanceParams = Static<typeof ListGameInstanceParams>;

async function listGameInstances(
    req: HttpRequest & WithPath<TListGameInstanceParams>,
    _: AzureHttpRequestContext,
): Promise<HttpResponse<ListGameInstanceResponse[]>> {
    const instances: ShortGameInstance[] = (await GameInstanceManager.list(req.path.game)).map((i) => ({
        game: i.game,
        instance: i.instance,
    }));
    return response.ok({ instances });
}

app.get("ListGameInstances", {
    route: "v1/game/{game}",
    authLevel: "anonymous",
    handler: httpHandler({
        handler: listGameInstances,
    }),
});
