import {Events} from "discord.js";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {DiscordConnection} from "../classes/discordConnection.js";
import type Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    client.on<Events.GuildDelete>(Events.GuildDelete, async guild => {
        const guildId = guild.id;
        const guildClusters = await Cluster.find({guildIds: {$elemMatch: {$eq: guild.id}}});
        for (const cluster of guildClusters) {
            cluster.removeGuildId(guildId);
            if (cluster.guildIds.length === 0) {
                await Connection.removeCluster(cluster._id);
                await cluster.remove();
            } else {
                await cluster.update();
            }
        }
        const inactiveClusters = await Cluster.find({inviteList: {$elemMatch: {$eq: guild.id}}});
        for (const cluster of inactiveClusters) {
            cluster.removeInviteList(guildId);
            await cluster.update();
        }
    });

    client.on<Events.ChannelDelete>(Events.ChannelDelete, async channel => {
        const channelId = channel.id;
        const clusters = await DiscordConnection.find({"data.channelId": channelId});
        for (const cluster of clusters) {
            await cluster.remove();
        }
    });
};

export default procs;
