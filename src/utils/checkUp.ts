import {Client} from "discord.js";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {DiscordConnection} from "../classes/discordConnection.js";

export async function startCheckUp(client: Client) {
    console.log("Cluster CheckUp start");
    await Cluster.autoDelete(client);
    console.log("Cluster CheckUp Done");
    console.log("Connection CheckUp start");
    await Connection.autoDelete();
    console.log("Connection CheckUp Done");
    console.log("Discord unaccesible remove start");
    await DiscordConnection.removeUnaccesible(client);
    console.log("Discord unaccesible remove done");
    console.log();
}
