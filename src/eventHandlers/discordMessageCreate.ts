import {ChannelType, Events} from "discord.js";

import {DiscordConnection} from "../classes/discordConnection.js";
import {DiscordMessage} from "../classes/discordMessage.js";
import Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        await (async function teamsReacter() {
            if (message.channel === null || message.channel.type !== (ChannelType.GuildText && ChannelType.GuildAnnouncement)) {
                return;
            }
            if (message.author.bot) {
                return;
            }

            let guildName;
            if (message.guild === null) {
                guildName = "Direct Message"; // For future use
            } else {
                guildName = message.guild.name;
            }
            const channelName = message.channel.name;
            try {
                const discordChannel = await DiscordConnection.findActiveOne({
                    "data.channelId": message.channelId,
                    platform: "discord",
                });
                if (discordChannel) {
                    const discordMessage = new DiscordMessage(client)
                        .setConnection(discordChannel)
                        .setGuildName(guildName)
                        .setChannelName(channelName)
                        .setUsername(message.author.displayName)
                        .setIcon(message.author.displayAvatarURL({extension: "png"}))
                        .setContent(message.content);
                    for (const attachment of message.attachments.values()) {
                        if (
                            attachment.contentType !== null &&
                            attachment.contentType.split("/")[0] === ("image" || "video") &&
                            attachment.contentType !== "image/webp"
                        ) {
                            discordMessage.addImage({
                                url: attachment.url,
                                name: attachment.name,
                                type: attachment.contentType,
                            });
                        } else {
                            discordMessage.addFile({
                                url: attachment.url,
                                name: attachment.name,
                                type: attachment.contentType ?? undefined,
                            });
                        }
                    }
                    await discordMessage.sendAll();
                }
            } catch (e) {
                console.error(e);
            }
        })();
    });
};

export default procs;
