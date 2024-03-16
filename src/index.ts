import {join} from "path";

import lineSdk from "@line/bot-sdk";
import {Client, Events, GatewayIntentBits} from "discord.js";
import express from "express";

import {Command} from "./interfaces/command.js";
import {startCheckUp} from "./utils/checkUp.js";
import {scheduling} from "./utils/cron.js";
import config from "./utils/envConf.js";
import line from "./utils/line.js";
import {getSourceFiles} from "./utils/tools.js";

const __dirname = import.meta.dirname;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildWebhooks],
});

const lineClient = new lineSdk.Client({
    channelAccessToken: config.line.channelAccessToken,
    channelSecret: config.line.channelSecret,
});
const apiServer = express();

const commandList = new Map<string, Command>();
const commandsPath = join(__dirname, "commands");
let commandsFiles = new Array<string>();

client.once<Events.ClientReady>(Events.ClientReady, async () => {
    commandsFiles = getSourceFiles(commandsPath);
    for (const file of commandsFiles) {
        const filePath = `file://${file}`;
        await import(filePath).then(commands => {
            for (const command of commands.default) {
                commandList.set(command.data.name, command);
            }
        });
    }

    await scheduling(client);
    await startCheckUp(client);

    console.log("Ready");
});
export default commandList;

apiServer.post(
    "/line-webhook",
    lineSdk.middleware({
        channelAccessToken: config.line.channelAccessToken,
        channelSecret: config.line.channelSecret,
    }),
    async (req: express.Request, res: express.Response): Promise<express.Response> => {
        for (const event of req.body.events) {
            try {
                await line.platformEventHandler(client, lineClient, event);
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
    const handlersFiles = getSourceFiles(handlersPath);
    for (const file of handlersFiles) {
        const filePath = `file://${file}`;
        await import(filePath).then(handlers => {
            handlers.default(client);
        });
    }
})();

(async () => {
    await client.login(config.token);
    apiServer.listen(config.line.port, () => console.log(`API Server is Ready! (at http://localhost:${config.line.port}/)`));
})();
