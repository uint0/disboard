import { CommandData, LeafCommandOption, SubCommandOption, CommandType } from "../../types/discord/command";

export type ParsedCommand = {
    name: string;
    subcommand?: string;
    options: Record<string, string>;
};

export default function parseCommand(commandData: CommandData): ParsedCommand {
    const subcommands = commandData.options.filter((it): it is SubCommandOption => it.type === CommandType.SUB_COMMAND);
    if (subcommands.length > 1) {
        throw new Error("command had more than 1 subcommand");
    }

    const literals = Object.fromEntries(
        commandData.options
            .filter((it): it is LeafCommandOption => it.type !== CommandType.SUB_COMMAND)
            .map((it) => [it.name, it.value]),
    );

    if (subcommands.length !== 0) {
        const subcommand = subcommands[0];
        return {
            name: commandData.name,
            subcommand: subcommand.name,
            options: {
                ...Object.fromEntries(subcommand.options.map((it) => [it.name, it.value])),
                ...literals,
            },
        };
    } else {
        return {
            name: commandData.name,
            options: literals,
        };
    }
}
