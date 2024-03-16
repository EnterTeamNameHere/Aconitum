import type {ChatInputCommandInteraction} from "discord.js";
import {ObjectId} from "mongodb";

import type {ModalData} from "../commands/teams.js";
import {checkStringId, deleteMany, find} from "../utils/db.js";
import {autoDeleteMessage} from "../utils/tools.js";

import {Cluster} from "./cluster.js";
import type {DiscordConnectionBase} from "./discordConnection.js";
import {DiscordConnection} from "./discordConnection.js";
import type {LineConnectionBase} from "./lineConnection.js";
import {LineConnection} from "./lineConnection.js";
import type {SlackConnectionBase} from "./slackConnection.js";
import {SlackConnection} from "./slackConnection.js";
import type {TeamsConnectionBase} from "./teamsConnection.js";
import {TeamsConnection} from "./teamsConnection.js";

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

    // static methods
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
            const {replied, channel} = interaction;
            const modalSubmit = interaction.isModalSubmit();
            try {
                if (modalSubmit && channel) {
                    await autoDeleteMessage(channel, result, 5);
                }
                if (replied) {
                    await interaction.editReply(result);
                } else {
                    await interaction.reply(result);
                }
            } catch {
                if (channel) {
                    await autoDeleteMessage(channel, result, 5);
                } else {
                    throw new Error("Interaction's channel is null");
                }
            }
            return null;
        }
        return result;
    }

    static async removeCluster(clusterId: ObjectId): Promise<void> {
        await deleteMany<ConnectionBase>("connections", {clusterId});
    }

    static async autoDelete() {
        const connectionBases = await find<ConnectionBase>("connections", {});
        const connections = new Array<Connection>();
        for (const connectionBase of connectionBases) {
            connections.push(new Connection(connectionBase));
        }
        for (const connection of connections) {
            if (!(await Cluster.isIncludes({_id: connection.clusterId}))) {
                await deleteMany<ConnectionBase>("connections", {_id: connection._id});
            }
        }
    }

    static async allCacheClear() {
        await deleteMany<ModalData>("connectionCaches", {});
    }

    static async cacheClear() {
        const caches = await find<ModalData>("connectionCaches", {});
        for (const cache of caches) {
            const timestamp = cache.timestamp.getTime();
            const now = new Date().getTime();
            if (now - timestamp > 1000 * 60) {
                await deleteMany<ModalData>("connectionCaches", {_id: cache._id});
            }
        }
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
