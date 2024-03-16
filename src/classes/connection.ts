import type {ChatInputCommandInteraction} from "discord.js";
import {ObjectId} from "mongodb";

import {checkStringId} from "../utils/db.js";

import {Cluster} from "./cluster.js";
import type {DiscordConnectionBase} from "./discordConnection.js";
import {DiscordConnection} from "./discordConnection.js";
import type {LineConnectionBase} from "./lineConnection.js";
import {LineConnection} from "./lineConnection.js";
import type {SlackConnectionBase} from "./slackConnection.js";
import {SlackConnection} from "./slackConnection.js";
import type {TeamsConnectionBase} from "./teamsConnection.js";
import {TeamsConnection} from "./teamsConnection.js";

// export type OmitFunction<T> = Pick<
//   T,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   {[K in keyof T]: T[K] extends (...args: any) => any ? never : K}[keyof T]
// >

export type CollectionName = "clusters" | "connections" | "connectionCaches";
export type Platform = "uncategorized" | "discord" | "teams" | "line" | "slack";

type ConnectionBase = {
    _id: ObjectId;
    clusterId: ObjectId;
    name: string;
    platform: Platform;
    active: boolean;
};

type Connections = Connection | DiscordConnection | TeamsConnection | LineConnection | SlackConnection;
type ConnectionBases = ConnectionBase | DiscordConnectionBase | TeamsConnectionBase | LineConnectionBase | SlackConnectionBase;

class Connection {
    _id: ObjectId = new ObjectId();
    clusterId: ObjectId = new ObjectId();
    name: string = "";
    platform: Platform = "uncategorized";
    active: boolean = false;

    constructor(connection?: Partial<ConnectionBases>) {
        if (connection) {
            Object.assign(this, connection);
        }
    }

    static async createConnectionData(interaction: ChatInputCommandInteraction): Promise<ConnectionBase | null> {
        const result = await (async (): Promise<ConnectionBase | string> => {
            const clusterId = interaction.options.getString("cluster-id", true);
            if (!(await checkStringId(clusterId))) {
                return "クラスターIDが不適切です。";
            }
            const clusterObjectId = new ObjectId(clusterId);
            const connectionName = interaction.options.getString("connection-name", true);
            const {guildId} = interaction;
            if (guildId === null) {
                throw new Error("Interaction's guildId is null");
            }
            if (!(await Cluster.checkGuildId(clusterId, guildId))) {
                return "指定されたクラスターが見つかりませんでした。";
            }

            return {
                _id: new ObjectId(),
                clusterId: clusterObjectId,
                name: connectionName,
                platform: "uncategorized",
                active: true,
            };
        })();

        if (typeof result === "string") {
            const {deferred, channel} = interaction;
            const repliable = interaction.isRepliable();
            if (repliable) {
                if (deferred) {
                    await interaction.editReply(result);
                } else {
                    await interaction.reply(result);
                }
            } else if (channel) {
                await channel.send(result);
            }
            return null;
        }
        return result;
    }

    // set and get
    getBase(): ConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
        };
    }

    setStringId(value: string) {
        this._id = new ObjectId(value);
        return this;
    }

    getStringId(): string {
        return this._id.toHexString();
    }

    setStringClusterId(value: string) {
        this.clusterId = new ObjectId(value);
        return this;
    }

    getStringClusterId(): string {
        return this.clusterId.toHexString();
    }

    setId(value: ObjectId) {
        this._id = value;
        return this;
    }

    setClusterId(value: ObjectId) {
        this.clusterId = value;
        return this;
    }

    setName(value: string) {
        this.name = value;
        return this;
    }

    setPlatform(value: Platform) {
        this.platform = value;
        return this;
    }
    setActive(value: boolean) {
        this.active = value;
        return this;
    }
}

export {Connection, Connections, ConnectionBase, ConnectionBases};
