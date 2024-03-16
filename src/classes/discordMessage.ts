import type {Client} from "discord.js";

import {DiscordConnection} from "./discordConnection.js";
import type {UnityMessageBase} from "./unityMessage.js";
import {UnityMessage} from "./unityMessage.js";

export type DiscordMessageBase = UnityMessageBase & {
    platform: "discord";
    connection: DiscordConnection;
};

export class DiscordMessage extends UnityMessage<DiscordConnection> implements DiscordMessageBase {
    platform = "discord" as const;

    constructor(client: Client, base?: DiscordMessageBase) {
        super(client, new DiscordConnection(), base);
        if (base) {
            Object.assign(this, base);
        }
    }

    protected async sendingDiscordChannels(): Promise<Array<DiscordConnection>> {
        return DiscordConnection.find({
            platform: "discord",
            clusterId: this.connection.clusterId,
            active: true,
            "data.channelId": {$ne: this.connection.data.channelId},
        });
    }
}
