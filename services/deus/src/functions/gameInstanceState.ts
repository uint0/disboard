import { app } from "@azure/functions";
import { Type, type Static } from "@sinclair/typebox";
import httpHandler from "../framework/web";
import { response } from "../framework/web/response";
import {
    AzureHttpRequestContext,
    HttpErrorBody,
    HttpRequest,
    HttpResponse,
    WithBody,
    WithPath,
} from "../framework/web/types";
import GameInstanceManager from "../components/gameInstance";
import { GameInstancePath, TGameInstancePath } from "./models";

const InstanceStatusRequest = Type.Object({
    status: Type.Union([Type.Literal("Running"), Type.Literal("Stopped")]),
    transitionPolicy: Type.Optional(Type.Union([Type.Literal("Restart")])),
});
type TInstanceStatusRequest = Static<typeof InstanceStatusRequest>;

type DefaultHttpRequest = HttpRequest & WithPath<TGameInstancePath>;

async function updateGameInstanceStatus(
    req: DefaultHttpRequest & WithBody<TInstanceStatusRequest>,
    _: AzureHttpRequestContext,
): Promise<HttpResponse<HttpErrorBody | { previousStatus: string }>> {
    const { game, instance } = req.path;
    const { status, transitionPolicy } = req.body;

    const gameInstance = await GameInstanceManager.find(game, instance);
    if (gameInstance === null) {
        return response.notFound({
            error: `game instance ${game}/${instance} not found or does not have tagged compute component`,
        });
    }

    const effectiveCurrentStatus = await gameInstance.getEffectiveStatus();

    // TODO: nice to have - exhaustiveness check
    if (status === "Running") {
        if (effectiveCurrentStatus !== status) {
            await gameInstance.start();
        } else if (transitionPolicy === "Restart") {
            await gameInstance.restart();
        }
    } else if (status === "Stopped") {
        if (effectiveCurrentStatus !== status) {
            await gameInstance.stop();
        }
    }

    return response.accepted({
        previousStatus: effectiveCurrentStatus,
    });
}

async function getGameInstanceStatus(
    req: DefaultHttpRequest,
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

app.put("UpdateGameInstanceStatus", {
    route: "v1/game/{game}/{instance}/status",
    authLevel: "anonymous",
    handler: httpHandler({
        path: GameInstancePath,
        body: InstanceStatusRequest,
        handler: updateGameInstanceStatus,
    }),
});
