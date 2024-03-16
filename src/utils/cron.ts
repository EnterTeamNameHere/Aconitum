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
            console.log("checkup: cluster");
            await Cluster.autoDelete(client);
            console.log("checkup: connection");
            await Connection.autoDelete();
            console.log("checkup: cache");
            await Connection.cacheClear();
            console.log("checkup: discord");
            await DiscordConnection.removeUnaccesible(client);
            console.log();
        })();
    });
}
