import {readdirSync} from "fs";
import {join} from "path";

import lineSDK from "@line/bot-sdk";
import {Client, Events, GatewayIntentBits} from "discord.js";
import express from "express";

import {Command} from "./interfaces/command.js";
import config from "./utils/envConf.js";
import line from "./utils/line.js";

const __dirname = import.meta.dirname;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const lineClient = new lineSDK.Client({channelAccessToken: config.line.channelAccessToken, channelSecret: config.line.channelSecret});
const APIServer = express();

const commandList = new Map<string, Command>();
const commandsPath = join(__dirname, "commands");
const commandsFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
client.once<Events.ClientReady>(Events.ClientReady, async () => {
    for (const file of commandsFiles) {
        const filePath = `file://${join(commandsPath, file)}`;
        await import(filePath).then(commands => {
            for (const command of commands.default) {
                commandList.set(command.data.name, command);
            }
        });
    }

    console.log("Ready");
});
export default commandList;

APIServer.post(
    "/line-webhook",
    lineSDK.middleware({channelAccessToken: config.line.channelAccessToken, channelSecret: config.line.channelSecret}),
    async (req: express.Request, res: express.Response): Promise<express.Response> => {
        for (const event of req.body.events) {
            try {
                await line.platformEventHandler(lineClient, event);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error(e);
                }
                return res.status(500);
            }
        }
        return res.status(200);
    },
);

(async () => {
    const handlersPath = join(__dirname, "eventHandlers");
    const handlersFiles = readdirSync(handlersPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
    for (const file of handlersFiles) {
        const filePath = `file://${join(handlersPath, file)}`;
        await import(filePath).then(handlers => {
            handlers.default(client);
        });
    }
})();

(async () => {
    await client.login(config.token);
    APIServer.listen(config.line.port, () => console.log(`API Server is Ready! (at http://localhost:${config.line.port}/)`));
})();
