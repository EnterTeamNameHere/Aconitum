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
    };
    line: {
        id: string;
        token: string;
    };
    slack: {
        send: string;
        recv: string;
    };
    guild: string;
    channel: string;
}
