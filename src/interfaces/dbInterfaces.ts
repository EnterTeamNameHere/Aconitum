import {ObjectId} from "mongodb";

export interface Guild {
    _id?: ObjectId;
    guildId: string;
    connections: Array<ObjectId>;
}

export interface Connection {
    _id?: ObjectId;
    teams: {
        send: string;
        recv: string;
        active: boolean;
    };
    line: {
        id: string;
        token: string;
        active: boolean;
    };
    slack: {
        send: string;
        recv: string;
        active: boolean;
    };
    guild: string;
    channel: string;
    webhook: string;
}
