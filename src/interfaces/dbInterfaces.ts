import {ObjectId} from "mongodb";

export interface Guild {
    _id: ObjectId;
    guildId: string;
}

export interface Connection {
    _id: ObjectId;
    guildId: string;
    channelId: string;
    name: string;
    platform: Platform;
}

export type Platform = "teams" | "line" | "slack";

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
