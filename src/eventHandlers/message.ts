import axios from "axios";
import {Events, GuildTextBasedChannel} from "discord.js";

import {TeamsConnection} from "../interfaces/dbInterfaces.js";
import Procs from "../interfaces/eventHandler.js";
import connectionData from "../utils/connectionData.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        console.log(message);
        await (async function teamsReacter() {
            if (message.guildId !== null) {
                const messageCard = {
                    "@type": "MessageCard",
                    "@context": "https://schema.org/extensions",
                    summary: "Discordからのメッセージを受信しました",
                    sections: [
                        {
                            activityImage: message.author.displayAvatarURL({extension: "png"}),
                            activityTitle: message.author.displayName,
                            activitySubtitle: `at \`#${(message.channel as GuildTextBasedChannel).name}\` in \`${message.guild?.name}\``,
                            activityText: message.content,
                            images: message.attachments.map(attachment => ({image: attachment.url, title: attachment.name})),
                            text: message.attachments.map(attachment => `- [${attachment.name}](${attachment.url})\n`).join("\n"),
                        },
                    ],
                    themeColor: "9B59B6",
                };
                console.log(JSON.stringify(messageCard, null, "\t"));
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
