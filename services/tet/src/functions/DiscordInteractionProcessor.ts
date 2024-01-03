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
                    if (command.options.game === undefined && command.options.instance !== undefined) {
                        await respond.text("Cannot get by instance without game");
                    } else if (command.options.game === undefined && command.options.instance === undefined) {
                        const x = await deus.listGameInstances();
                        if ("error" in x) {
                            await respond.text(
                                `❗️ Retrieving \`${command.options.game}/${command.options.instance}\` failed:\n\`\`\`${x.error.error}\`\`\``,
                            );
                        } else {
                            await respond.text(
                                `Available games:\n` +
                                    x.response.games
                                        .flatMap((g) => [
                                            `- \`${g.game}\``,
                                            ...g.instances.map((i) => [`  - \`${i.instance}\``]),
                                        ])
                                        .join("\n"),
                            );
                        }
                    } else if (command.options.instance === undefined) {
                        const x = await deus.listInstancesForGame(command.options.game);
                        if ("error" in x) {
                            await respond.text(
                                `❗️ Retrieving \`${command.options.game}/${command.options.instance}\` failed:\n\`\`\`${x.error.error}\`\`\``,
                            );
                        } else {
                            await respond.text(
                                `Available instances for \`${command.options.game}\`:\n` +
                                    x.response.instances.map((i) => `- \`${i.instance}\``).join("\n"),
                            );
                        }
                    } else {
                        const x = await deus.getGameInstance({
                            game: command.options.game,
                            instance: command.options.instance,
                        });
                        if ("error" in x) {
                            await respond.text(
                                `❗️ Retrieving \`${command.options.game}/${command.options.instance}\` failed:\n\`\`\`${x.error.error}\`\`\``,
                            );
                        } else {
                            // TODO: move to better location
                            const { response } = x;
                            await respond.raw({
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                style: 3,
                                                label: `[WIP] Start`,
                                                custom_id: `START`,
                                                disabled: response.status === "Running",
                                                type: 2,
                                            },
                                            {
                                                style: 4,
                                                label: `[WIP] Stop`,
                                                custom_id: `STOP`,
                                                disabled: response.status === "Stopped",
                                                type: 2,
                                            },
                                            {
                                                style: 1,
                                                label: `[WIP] Restart`,
                                                custom_id: `RESTART`,
                                                disabled: response.status === "Stopped",
                                                type: 2,
                                            },
                                        ],
                                    },
                                ],
                                embeds: [
                                    {
                                        type: "rich",
                                        title: `${response.game} / ${response.instance}`,
                                        description: "",
                                        color: response.status == "Running" ? 0x00ff00 : 0xff0000,
                                        fields: [
                                            {
                                                name: `Game`,
                                                value: response.game,
                                                inline: true,
                                            },
                                            {
                                                name: `Instance`,
                                                value: response.instance,
                                                inline: true,
                                            },
                                            {
                                                name: `Status`,
                                                value: response.status,
                                                inline: true,
                                            },
                                        ],
                                        author: {
                                            name: `Disboard`,
                                        },
                                    },
                                ],
                            });
                        }
                    }
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
