/* eslint-disable */

import * as fs from "node:fs";
import * as path from "path";
import {REST, Routes} from "discord.js";
import config from "./envConf";
import {Commands} from "./interfaces/command";
import {RESTPostAPIChatInputApplicationCommandsJSONBody} from "discord-api-types/v10";

const commandArray = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
const commandsPath = path.join(__dirname, "commands");
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
const rest = new REST().setToken(config.token);

(async () => {
    console.log(commandsPath);
    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file);
        const commands = (await import(filePath)).commands;
        for (const command of commands) {
            commandArray.push(command.data.toJSON());
        }
    }

    try {
        await rest.put(Routes.applicationCommands(config.clientId), {body: commandArray});
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
