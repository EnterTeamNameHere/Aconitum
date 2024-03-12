import type {Snowflake} from "discord-api-types/globals.js";
import {ObjectId} from "mongodb";

export type CollectionName = "guilds" | "clusters" | "connections";

// export interface Guild {
//     _id?: ObjectId;
//     id: Snowflake;
// }

export interface Cluster {
    _id?: ObjectId;
    guildId: Snowflake;
    name: string;
}

export type Platform = "discord" | "teams" | "line" | "slack";

export interface Connection {
    _id?: ObjectId;
    clusterId: ObjectId;
    name: string;
    platform: Platform;
}

export interface DiscordConnection extends Connection {
    data: {
        channelId: Snowflake;
        channelWebhook: string;
    };
}

export interface TeamsConnection extends Connection {
    data: {
        sendWebhook: string;
    };
}

export interface LineConnection extends Connection {
    data: {
        id: string;
        token: string;
    };
}

export interface SlackConnection extends Connection {
    data: {
        send: string;
        recv: string;
    };
}
