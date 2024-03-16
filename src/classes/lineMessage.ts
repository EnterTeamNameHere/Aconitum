import type {Client} from "discord.js";

import {LineConnection} from "./lineConnection.js";
import {UnityMessage} from "./unityMessage.js";
import type {UnityMessageBase} from "./unityMessage.js";

export type LineMessageBase = UnityMessageBase & {
    platform: "line";
    connection: LineConnection;
};

export class LineMessage extends UnityMessage<LineConnection> implements LineMessageBase {
    platform = "line" as const;

    constructor(client: Client, base?: LineMessageBase) {
        super(client, new LineConnection(), base);
        if (base) {
            Object.assign(this, base);
        }
    }

    protected async sendingLineChannels(): Promise<Array<LineConnection>> {
        return LineConnection.find({
            platform: "line",
            clusterId: this.connection.clusterId,
            active: true,
            "data.groupId": {$ne: this.connection.data.groupId},
        });
    }
}
