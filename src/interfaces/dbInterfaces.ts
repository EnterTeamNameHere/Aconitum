import type {Snowflake} from "discord-api-types/globals.js";
import {ObjectId} from "mongodb";

export type CollectionName = "clusters" | "connections";

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
    platform: "discord";
    data: {
        channelId: Snowflake;
        channelWebhook: string;
    };
}

export interface TeamsConnection extends Connection {
    platform: "teams";
    data: {
        sendWebhook: string;
    };
}

export interface LineConnection extends Connection {
    platform: "line";
    data: {
        id: string;
        token: string;
    };
}

export interface SlackConnection extends Connection {
    platform: "slack";
    data: {
        send: string;
        recv: string;
    };
}
