import {readdirSync} from "fs";
import {join} from "path";

import {Client, CommandInteraction, Events, GatewayIntentBits, Interaction} from "discord.js";

import {Command} from "./interfaces/command.js";
import config from "./utils/envConf.js";

const __dirname = import.meta.dirname;

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const commandList = new Map<string, Command>();
const commandsPath = join(__dirname, "commands");
const commandsFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

client.once(Events.ClientReady, async () => {
    console.log("Ready");
    for (const file of commandsFiles) {
        const filePath = `file://${join(commandsPath, file)}`;
        await import(filePath).then(commands => {
            for (const command of commands.default) {
                commandList.set(command.data.name, command);
            }
        });
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
