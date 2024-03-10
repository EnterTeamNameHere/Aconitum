import axios from "axios";
import {Events} from "discord.js";

import {TeamsConnection} from "../interfaces/dbInterfaces.js";
import Procs from "../interfaces/eventHandler.js";
import connectionData from "../utils/connectionData.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        await (async function teamsReacter() {
            if (message.guildId !== null) {
                const messageCard = {
                    "@type": "MessageCard",
                    "@context": "https://schema.org/extensions",
                    text: message.cleanContent,
                    themeColor: "9b59b6",
                };
                const connections = await connectionData.find<TeamsConnection>({
                    guildId: message.guildId,
                    channelId: message.channelId,
                    platform: "teams",
                });
                for (const connection of connections) {
                    const webhookURI = connection.data.sendWebhook;
                    await axios.post(webhookURI, messageCard);
                }
            }
        })();
    });
};

export default procs;
