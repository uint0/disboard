// @ref https://discord.com/developers/docs/interactions/application-commands

enum CommandType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
}

type GroupingCommandOption = {
    name: string;
    description: string;
    type?: CommandType.SUB_COMMAND | CommandType.SUB_COMMAND_GROUP;
    options: CommandOption[]
};

type LeafCommandOption = {
    name: string;
    description: string;
    type: CommandType.STRING;
    required: boolean;
};

type CommandOption = LeafCommandOption | GroupingCommandOption;

type Command = GroupingCommandOption;

const gameOption: LeafCommandOption = {
    name: "game",
    description: "Game type (e.g. for vanilla minecraft this would be minecraft). Required if instance is set",
    type: CommandType.STRING,
    required: true
};

const instanceOption: LeafCommandOption = {
    name: "instance",
    description: "Game instance name (e.g. for vanilla minecraft this would be vanilla)",
    type: CommandType.STRING,
    required: true
}

const commands: Command[] = [
    {
        name: "game",
        description: "Control game instances on disboard",
        options: [
            {
                name: "get",
                description: "Get games or game instances on disboard",
                type: CommandType.SUB_COMMAND,
                options: [
                    { ...gameOption, required: false },
                    { ...instanceOption, required: false },
                ]
            },
            {
                name: "start",
                description: "Starts a game instance. Does nothing if the game is already running",
                type: CommandType.SUB_COMMAND,
                options: [
                    gameOption,
                    instanceOption,
                    {
                        name: "inactivity-timeout",
                        description: "Duration string. Idle time before server spins down. (default = 2h)",
                        type: CommandType.STRING,
                        required: false
                    }
                ]
            },
            {
                name: "restart",
                description: "Restarts a game instance. Starts the game if the game is stopped",
                type: CommandType.SUB_COMMAND,
                options: [
                    gameOption,
                    instanceOption,
                ]
            },
            {
                name: "stop",
                description: "Stops a game instance",
                type: CommandType.SUB_COMMAND,
                options: [
                    gameOption,
                    instanceOption,
                    {
                        name: "after",
                        description: "Duration string. Wait this duration before actually stopping",
                        type: CommandType.STRING,
                        required: false
                    }
                ]
            }
        ]
    }
];

(async function () {
    const APPLICATION_ID = process.env["APPLICATION_ID"];
    const GUILD_ID = process.env["GUILD_ID"];
    const BOT_TOKEN = process.env["BOT_TOKEN"];
    if(APPLICATION_ID === undefined || GUILD_ID === undefined || BOT_TOKEN === undefined) {
        throw new Error("required env: APPLICATION_ID, GUILD_ID, BOT_TOKEN");
    }

    // Don't promise.all to not need to worry too much about rate limits
    for (const command of commands) {
        console.log('[+] Registering command', command.name)    ;
        const resp = await fetch(
            `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bot ${BOT_TOKEN}`,
                },
                body: JSON.stringify(command),
            }
        );

        if(resp.ok) {
            console.log("[+] Registered", command.name)
        } else {
            console.error("[-] Error registering", command.name, resp.status, await resp.text());
        }
    }
})();
