import { readdirSync } from "fs";
import { join } from "path";

import {Client, CommandInteraction, Events, GatewayIntentBits, Interaction} from "discord.js";

import config from "./envConf";
import {Command, Commands} from "./interfaces/command.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const commandList = new Map<string, Command>();
const commandsPath = join(__dirname, "commands");
const commandsFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

client.once(Events.ClientReady, async () => {
    console.log("Ready");
    console.log(`Type: ${config.type}`);
    for (const file of commandsFiles) {
        const filePath = join(commandsPath, file);
        const commands: Commands = await import(filePath);
        for (const command of commands) {
            commandList.set(command.data.name, command);
        }
    }
});

async function commandProcess(interaction: CommandInteraction) {
    const {commandName} = interaction;
    const command = commandList.get(commandName);
    if (command) {
        await command.execute(interaction);
    } else {
        console.error(`The Command ${commandName} is not available`);
    }
}

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isCommand()) {
        await commandProcess(interaction);
    }
});

client.login(config.token);
