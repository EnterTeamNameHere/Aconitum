import type {ObjectId} from "mongodb";

import type {Connection} from "../interfaces/dbInterfaces.js";

export class UnityMessage {
    private connection: Connection;

    private connectionId: ObjectId;

    private content: string;

    private icon: string;

    constructor(connection: Connection, connectionId: ObjectId, content: string, icon: string) {
        this.connection = connection;
        this.connectionId = connectionId;
        this.content = content;
        this.icon = icon;
    }
}
