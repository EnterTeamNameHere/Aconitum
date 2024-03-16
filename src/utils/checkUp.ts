import {Client} from "discord.js";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {DiscordConnection} from "../classes/discordConnection.js";

export async function startCheckUp(client: Client) {
    console.log("checkup: cluster");
    await Cluster.autoDelete(client);
    console.log("checkup: connection");
    await Connection.autoDelete();
    console.log("checkup: cache");
    await Connection.allCacheClear();
    console.log("checkup: discord");
    await DiscordConnection.removeUnaccesible(client);
    console.log();
}
