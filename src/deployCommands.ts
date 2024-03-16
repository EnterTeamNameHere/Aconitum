import {join} from "path";

import {RESTPostAPIChatInputApplicationCommandsJSONBody} from "discord-api-types/v10";
import {REST, Routes} from "discord.js";

import config from "./utils/envConf.js";
import {getSourceFiles} from "./utils/tools.js";

const __dirname = import.meta.dirname;

const globalCommandArray = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
const guildCommandArray = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
const commandsPath = join(__dirname, "commands");
const rest = new REST().setToken(config.token);

(async () => {
    const commandsFiles = getSourceFiles(commandsPath);
    for (const file of commandsFiles) {
        const filePath = `file://${file}`;
        await import(filePath).then(commands => {
            for (const command of commands.default) {
                if (command.global) {
                    globalCommandArray.push(command.data.toJSON());
                } else {
                    guildCommandArray.push(command.data.toJSON());
                }
            }
        });
    }

    try {
        await rest.put(Routes.applicationCommands(config.clientId), {body: globalCommandArray});
    } catch (error) {
        console.error(error);
    }

    try {
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {body: guildCommandArray});
    } catch (error) {
        console.error(error);
    }

    const registeredGlobalCommands = await rest.get(Routes.applicationCommands(config.clientId));
    const registeredGuildCommands = await rest.get(Routes.applicationGuildCommands(config.clientId, "1204984761748160542"));
    console.log("---- global command list ----");
    for (const command of registeredGlobalCommands) {
        console.log(`/${command.name}`);
        console.log(`  ID:${command.id}`);
        console.log(`  ${command.description}`);
    }
    console.log("---- guild command list -----");
    for (const command of registeredGuildCommands) {
        console.log(`/${command.name}`);
        console.log(`  ID:${command.id}`);
        console.log(`  ${command.description}`);
    }
    console.log("---------------------------");
})();
