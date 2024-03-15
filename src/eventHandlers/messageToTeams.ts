import axios from "axios";
import {Events, GuildTextBasedChannel} from "discord.js";

import {DiscordConnection} from "../classes/discordConnection.js";
import {TeamsConnection} from "../classes/teamsConnection.js";
import Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        await (async function teamsReacter() {
            try {
                const discordChannels = await DiscordConnection.find({
                    "data.channelId": message.channelId,
                    platform: "discord",
                });
                if (discordChannels.length > 0) {
                    const teamsConnections = await TeamsConnection.find({
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
            } catch (e) {
                console.error(e);
            }
        })();
    });
};

export default procs;
