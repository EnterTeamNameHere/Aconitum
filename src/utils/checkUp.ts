import {Client} from "discord.js";

import {Cluster} from "../classes/cluster.js";

export async function startCheckUp(client: Client) {
    console.log("Cluster CheckUp");
    await Cluster.autoDelete(client);
}
