import { InvocationContext, app } from "@azure/functions";
import { DISCORD_DEFERRED_CONN_STR_CONF_KEY, DISCORD_DEFERRED_QUEUE_NAME } from "../../constants/azure";
import { InteractionApplicationCommandRequest, InteractionType } from "../types/discord/interaction";
import DiscordDeferredReponder from "../components/discord/DiscordDeferredResponder";
import DeusClient from "../components/deus/DeusClient";
import { DEUS_BASE_URL } from "../../constants/deus";
import parseCommand from "../components/discord/CommandParser";
import GameInstanceUpdateStatusHandler from "./handlers/gameinstance/updateStatus";

app.storageQueue("DiscordInteractionProcessor", {
    queueName: DISCORD_DEFERRED_QUEUE_NAME,
    connection: DISCORD_DEFERRED_CONN_STR_CONF_KEY,
    async handler(queueEntry: unknown, _: InvocationContext): Promise<void> {
        const { interaction } = queueEntry as { interaction: InteractionApplicationCommandRequest };

        const respond = new DiscordDeferredReponder({
            token: interaction.token,
            applicationId: interaction.application_id,
        });

        const deus = new DeusClient(DEUS_BASE_URL);

        if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
            await respond.text("We currently only support slash command based operations");
            return;
        }

        const command = parseCommand(interaction.data);
        if (command.name === "game") {
            switch (command.subcommand) {
                case "start":
                case "restart":
                case "stop":
                    const { pretty } = await new GameInstanceUpdateStatusHandler(
                        {
                            game: command.options.game,
                            instance: command.options.instance,
                        },
                        deus,
                    ).updateStatus(command.subcommand);
                    await respond.text(pretty);
                    break;
                case "get":
                    await respond.text("get tbd");
                    break;
                default: {
                    await respond.text(`Unknown subcommand ${command.subcommand}`);
                    return;
                }
            }
        } else {
            throw new Error(`Unknown interaction command name: ${interaction.data.name}`);
        }
    },
});
