import axios from "axios";
import {Events, GuildTextBasedChannel} from "discord.js";

import { TeamsConnection} from "../interfaces/dbInterfaces.js";
import type {DiscordConnection} from "../interfaces/dbInterfaces.js";
import Procs from "../interfaces/eventHandler.js";
import connectionData from "../utils/connectionData.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        await (async function teamsReacter() {
            const discordChannels = await connectionData.find<DiscordConnection>({
                data: {
                    channelId: message.channelId,
                },
                platform: "discord",
            });
            if (discordChannels.length > 0) {
                const teamsConnections = await connectionData.find<TeamsConnection>({
                    clusterId: discordChannels[0].clusterId,
                    platform: "teams",
                });
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
                            images: message.attachments.map(attachment => ({
                                image: attachment.url,
                                title: attachment.name,
                            })),
                            text: message.attachments.map(attachment => `- [${attachment.name}](${attachment.url})\n`).join("\n"),
                        },
                    ],
                    themeColor: "9B59B6",
                };
                for (const teamsConnection of teamsConnections) {
                    const webhookURI = teamsConnection.data.sendWebhook;
                    await axios.post(webhookURI, messageCard);
                }
            }
        })();
    });
};

export default procs;
