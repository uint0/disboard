import { createPublicKey, verify } from "node:crypto";

import { HttpRequest, HttpResponseInit, InvocationContext, app } from "@azure/functions";
import {
    InteractionCallbackType,
    InteractionDeferredMessageResponse,
    InteractionPongResponse,
    InteractionRequest,
    InteractionType,
} from "../types/discord/interaction";
import { QueueClient } from "@azure/storage-queue";
import { DISCORD_DEFERRED_CONN_STR, DISCORD_DEFERRED_QUEUE_NAME } from "../../constants/azure";
import { DISCORD_BOT_PUBLIC_KEY } from "../../constants/discord";

const PUBLIC_KEY = createPublicKey({
    format: "der",
    type: "spki",
    key: Buffer.concat([
        // @ref https://keygen.sh/blog/how-to-use-hexadecimal-ed25519-keys-in-node/
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(DISCORD_BOT_PUBLIC_KEY, "hex"),
    ]),
});

function verifyDiscordSignature(signature: string, timestamp: string, body: string): boolean {
    return verify(null, Buffer.from(`${timestamp}${body}`), PUBLIC_KEY, Buffer.from(signature, "hex"));
}

function b64(s: string): string {
    const bytes = new TextEncoder().encode(s);
    return btoa(String.fromCodePoint(...bytes));
}

app.post("DiscordInteraction", {
    route: "ext/discord/interaction",
    authLevel: "anonymous",
    async handler(req: HttpRequest, _c: InvocationContext): Promise<HttpResponseInit> {
        const secSig = req.headers.get("x-signature-ed25519");
        const secTs = req.headers.get("x-signature-timestamp");
        const rawBody = await req.text();

        if (secSig === null || secTs === null || !verifyDiscordSignature(secSig, secTs, rawBody)) {
            return { status: 401 };
        }

        // Discord interactions have a 3 second "first interaction" window. Hence we issue a response
        //   immediately and fire a background function to do the heavy lifting

        const interaction: InteractionRequest = JSON.parse(rawBody);
        if (interaction.type === InteractionType.PING) {
            const jsonBody: InteractionPongResponse = { type: InteractionCallbackType.PONG };
            return { status: 200, jsonBody };
        } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const jsonBody: InteractionDeferredMessageResponse = {
                type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            };

            const client = new QueueClient(DISCORD_DEFERRED_CONN_STR, DISCORD_DEFERRED_QUEUE_NAME);
            await client.sendMessage(b64(JSON.stringify({ interaction })));

            return { status: 200, jsonBody };
        } else {
            //@ts-expect-error
            return { status: 400, jsonBody: { error: `unsupport interaction code ${interaction.type}` } };
        }
    },
});
