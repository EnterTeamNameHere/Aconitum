import type {Client} from "discord.js";
import {schedule} from "node-cron";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {DiscordConnection} from "../classes/discordConnection.js";

export async function scheduling(client: Client) {
    // Cache clear
    schedule("0 0 */3 * * *", () => {
        console.log("Cache clear");
        Connection.cacheClear().then();
    });

    // DB clear
    schedule("0 0 5 * * *", () => {
        (async () => {
            console.log("DB clear");
            console.log("Cluster CheckUp start");
            await Cluster.autoDelete(client);
            console.log("Cluster CheckUp Done");
            console.log("Connection CheckUp start");
            await Connection.autoDelete();
            console.log("Connection CheckUp Done");
            console.log("Cache clear start");
            await Connection.cacheClear();
            console.log("Cache clear done");
            console.log("Discord unaccesible remove start");
            await DiscordConnection.removeUnaccesible(client);
            console.log("Discord unaccesible remove done");
            console.log();
        })();
    });
}
