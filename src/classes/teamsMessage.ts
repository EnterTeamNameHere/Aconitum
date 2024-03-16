import type {Client} from "discord.js";

import {TeamsConnection} from "./teamsConnection.js";
import {UnityMessage } from "./unityMessage.js";
import type {UnityMessageBase} from "./unityMessage.js";

export type TeamsMessageBase = UnityMessageBase & {
    platform: "teams";
    connection: TeamsConnection;
};

export class TeamsMessage extends UnityMessage<TeamsConnection> implements TeamsMessageBase {
    platform = "teams" as const;

    constructor(client: Client, base?: TeamsMessageBase) {
        super(client, new TeamsConnection(), base);
        if (base) {
            Object.assign(this, base);
        }
    }

    protected async sendingTeamsChannels(): Promise<Array<TeamsConnection>> {
        return TeamsConnection.find({
            platform: "teams",
            clusterId: this.connection.clusterId,
            active: true,
            $ne: {"data.sendWebhook": this.connection.data.sendWebhook},
        });
    }
}
