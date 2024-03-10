import {readdirSync} from "fs";
import {join} from "path";

import {Client, DiscordAPIError, Events,GatewayIntentBits} from "discord.js";

import {Command} from "./interfaces/command.js";
import connectionData from "./utils/connectionData.js";
import config from "./utils/envConf.js";
import guildData from "./utils/guildData.js";

const __dirname = import.meta.dirname;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commandList = new Map<string, Command>();
const commandsPath = join(__dirname, "commands");
const commandsFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));
client.once<Events.ClientReady>(Events.ClientReady, async () => {
    for (const file of commandsFiles) {
        const filePath = `file://${join(commandsPath, file)}`;
        await import(filePath).then(commands => {
            for (const command of commands.default) {
                commandList.set(command.data.name, command);
            }
        });
    }

    try {
        for (const {guildId} of await guildData.findAll()) {
            try {
                await client.guilds.fetch(guildId);
            } catch (e) {
                if (e instanceof DiscordAPIError && (e.code === 10004 || e.code === "10004")) {
                    await guildData.remove(guildId);
                } else {
                    throw e;
                }
            }
        }
        for (const guildId of client.guilds.cache.keys()) {
            await guildData.register(guildId);
        }

        for (const collection of await connectionData.find({})) {
            if (client.channels.cache.get(collection.channelId) === undefined) {
                await connectionData.remove(collection._id);
            }
        }
    } catch (e) {
        console.error("Error occurred at start.");
        throw e;
    }

    console.log("Ready");
});
export default commandList;

(async () => {
    const handlersPath = join(__dirname, "eventHandlers");
    const handlersFiles = readdirSync(handlersPath).filter(file => file.endsWith(".js"));
    for (const file of handlersFiles) {
        const filePath = `file://${join(handlersPath, file)}`;
        await import(filePath).then(handlers => {
            handlers.default(client);
        });
    }
})();

client.login(config.token);
