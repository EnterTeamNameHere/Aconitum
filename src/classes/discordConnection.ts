import type {Snowflake} from "discord-api-types/globals.js";
import {ObjectId} from "mongodb";
import type {Filter} from "mongodb";

import {deleteMany, find, findOne, isIncludes, updateOrInsert} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type DiscordConnectionBase = ConnectionBase & {
    platform: "discord";
    data: {
        channelId: Snowflake;
        channelWebhook: Snowflake;
    };
};

class DiscordConnection extends Connection<DiscordConnectionBase> implements DiscordConnectionBase {
    platform: "discord";
    data: {
        channelId: Snowflake;
        channelWebhook: Snowflake;
    };

    constructor(connection: Partial<DiscordConnectionBase>) {
        super(connection);
        this.platform = "discord";
        this.data = {
            channelId: "",
            channelWebhook: "",
        };
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    static async find(filter: Filter<DiscordConnectionBase>): Promise<Array<DiscordConnection>> {
        const connectionBases = await find<DiscordConnectionBase>("connections", filter);
        const connections = new Array<DiscordConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new DiscordConnection(connectionBase));
        }
        return connections;
    }

    static async findOne(filter: Filter<DiscordConnectionBase>): Promise<DiscordConnection | null> {
        const connectionBase = await findOne<DiscordConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new DiscordConnection(connectionBase);
    }

    static async isIncludes(filter: Filter<DiscordConnectionBase>): Promise<boolean> {
        return isIncludes<DiscordConnectionBase>("connections", filter);
    }

    static async remove(connectionId: ObjectId): Promise<void> {
        await deleteMany<DiscordConnectionBase>("connections", {_id: connectionId});
    }

    static async removeCluster(clusterId: ObjectId): Promise<void> {
        await deleteMany<DiscordConnectionBase>("connections", {clusterId});
    }

    getBase(): DiscordConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
            data: this.data,
        };
    }

    async isIncludes(): Promise<boolean> {
        return isIncludes<DiscordConnectionBase>("connections", this.getBase());
    }

    async register(): Promise<void> {
        return updateOrInsert<DiscordConnectionBase>(
            "connections",
            {
                platform: this.platform,
                name: this.name,
            },
            this.getBase(),
        );
    }

    async remove(): Promise<void> {
        return deleteMany<DiscordConnectionBase>("connections", this.getBase());
    }

    setConnectionBase(connectionBase: ConnectionBase): void {
        this._id = connectionBase._id;
        this.clusterId = connectionBase.clusterId;
        this.name = connectionBase.name;
        this.active = connectionBase.active;
    }

    getConnectionBase(): ConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
        };
    }

    setChannelId(channelId: Snowflake): void {
        this.data.channelId = channelId;
    }

    getChannelId(): Snowflake {
        return this.data.channelId;
    }

    setChannelWebhook(channelWebhook: Snowflake): void {
        this.data.channelWebhook = channelWebhook;
    }

    getChannelWebhook(): Snowflake {
        return this.data.channelWebhook;
    }
}

export {DiscordConnection};
export {DiscordConnectionBase};
