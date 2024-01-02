import { setTimeout } from "node:timers/promises";
import DeusClient, { SetGameInstanceStatusOpts } from "../../../components/deus/DeusClient";
import { GameInstance } from "../../../types/deus";

const MAX_ITERATIONS = 5;
const ITERATION_WAIT_INTERVAL_SECONDS = 2;

export type FormattedMessage = {
    pretty: string;
};

type FormatDisplayOptions = {
    verb: string;
    emoji: string;
};

type UpdateStatusResult = { info: { originalStatus: string } } | { warning: string } | { error: string };

export default class GameInstanceUpdateStatusHandler {
    constructor(
        private readonly instance: GameInstance,
        private readonly deusClient: DeusClient,
    ) {}

    async updateStatus(command: "start" | "restart" | "stop"): Promise<FormattedMessage> {
        switch (command) {
            case "start":
                return await this.start();
            case "restart":
                return await this.restart();
            case "stop":
                return await this.stop();
            default:
                throw new Error("unreachable");
        }
    }

    async start(): Promise<FormattedMessage> {
        const res = await this.setStatusAndWait("Running");
        return this.formatMessage(res, {
            verb: "Starting",
            emoji: "✅",
        });
    }

    async restart(): Promise<FormattedMessage> {
        const res = await this.setStatusAndWait("Running", { transitionPolicy: "Restart" });
        return this.formatMessage(res, {
            verb: "Restarting",
            emoji: "🔄",
        });
    }

    async stop(): Promise<FormattedMessage> {
        const res = await this.setStatusAndWait("Stopped");
        return this.formatMessage(res, {
            verb: "Stopping",
            emoji: "⛔️",
        });
    }

    private async setStatusAndWait(
        status: "Running" | "Stopped",
        options: SetGameInstanceStatusOpts = {},
    ): Promise<UpdateStatusResult> {
        const res = await this.deusClient.setGameInstanceStatus(this.instance, status, options);
        if ("error" in res) {
            return { error: res.error.error };
        }
        const originalStatus = res.response.previousStatus;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const res = await this.deusClient.getGameInstanceStatus(this.instance);
            if ("error" in res) {
                return { error: res.error.error };
            }

            if (res.response.status !== status) {
                await setTimeout(ITERATION_WAIT_INTERVAL_SECONDS * 1000);
            } else {
                return { info: { originalStatus } };
            }
        }
        return {
            warning: `Game did not reach ${status} status within ${
                MAX_ITERATIONS * ITERATION_WAIT_INTERVAL_SECONDS
            } seconds. Please manually check game state.`,
        };
    }

    private formatMessage(result: UpdateStatusResult, { verb, emoji }: FormatDisplayOptions): FormattedMessage {
        const instanceName = `\`${this.instance.game}/${this.instance.instance}\``;

        if ("error" in result) {
            return { pretty: `❗️ ${verb} ${instanceName} failed:\n\`\`\`${result.error}\`\`\`` };
        } else if ("warning" in result) {
            return { pretty: `⚠️ ${verb} ${instanceName}: ${result.warning}` };
        } else {
            return {
                pretty: `${emoji} ${verb} ${instanceName} succeeded (previous = \`${result.info.originalStatus}\`)`,
            };
        }
    }
}
