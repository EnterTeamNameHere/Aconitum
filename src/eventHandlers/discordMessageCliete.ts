import {ChannelType, Events} from "discord.js";

import {DiscordConnection} from "../classes/discordConnection.js";
import {DiscordMessage} from "../classes/discordMessage.js";
import Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        await (async function teamsReacter() {
            if (message.channel === null || message.channel.type !== (ChannelType.GuildText || ChannelType.GuildAnnouncement)) {
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
                        .setUsername(message.author.username)
                        .setIcon(message.author.avatarURL() ?? undefined)
                        .setContent(message.content);
                    for (const attachment of message.attachments.values()) {
                        if (attachment.height !== null && attachment.contentType !== ("webp" || null)) {
                            discordMessage.addImage(attachment);
                        } else {
                            discordMessage.addFile(attachment);
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
