export enum CommandType {
    SUB_COMMAND = 1,
    STRING = 3,
}

export type SubCommandOption = {
    name: string;
    type: CommandType.SUB_COMMAND;
    options: LeafCommandOption[];
};

export type LeafCommandOption = {
    name: string;
    value: string;
    type: CommandType.STRING;
};

export type CommandOption = LeafCommandOption | SubCommandOption;

export type CommandData = {
    name: string;
    options: CommandOption[];
};
