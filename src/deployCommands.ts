import { readdirSync } from "node:fs";
import { join } from "path";

import {RESTPostAPIChatInputApplicationCommandsJSONBody} from "discord-api-types/v10";
import {REST, Routes} from "discord.js";

import config from "./envConf";

const globalCommandArray = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
const guildCommandArray = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
const commandsPath = join(__dirname, "commands");
const commandsFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));
const rest = new REST().setToken(config.token);

(async () => {
    console.log(commandsPath);
    for (const file of commandsFiles) {
        const filePath = join(commandsPath, file);
        const {commands} = await import(filePath);
        for (const command of commands) {
            if (command.global) {
                globalCommandArray.push(command.data.toJSON());
            } else {
                guildCommandArray.push(command.data.toJSON());
            }
        }
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

    const registeredCommands = await rest.get(Routes.applicationCommands(config.clientId));
    console.log("---command list---");
    for (const command of registeredCommands) {
        console.log(`/${command.name}`);
        console.log(`  ID:${command.id}`);
        console.log(`  ${command.description}`);
    }
    console.log("-------------------");
})();
