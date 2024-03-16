import type {Snowflake} from "discord-api-types/globals.js";
import type {Client} from "discord.js";
import type {Filter} from "mongodb";
import {ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes, update} from "../utils/db.js";

import type {ConnectionBase} from "./connection.js";
import {Connection} from "./connection.js";

type DiscordConnectionBase = ConnectionBase & {
    platform: "discord";
    data: {
        channelId: Snowflake;
        channelWebhook: Snowflake;
    };
};

class DiscordConnection extends Connection implements DiscordConnectionBase {
    platform = "discord" as const;
    data: {
        channelId: Snowflake;
        channelWebhook: Snowflake;
    } = {
        channelId: "",
        channelWebhook: "",
    };

    constructor(connection?: Partial<DiscordConnectionBase>) {
        super(connection);
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    // static methods
    static async find(filter: Filter<DiscordConnectionBase>): Promise<Array<DiscordConnection>> {
        const connectionBases = await find<DiscordConnectionBase>("connections", filter);
        const connections = new Array<DiscordConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new DiscordConnection(connectionBase));
        }
        return connections;
    }

    static async findActive(filter: Filter<DiscordConnectionBase>): Promise<Array<DiscordConnection>> {
        const activeFilter = {...filter, active: true};
        return DiscordConnection.find(activeFilter);
    }

    static async findOne(filter: Filter<DiscordConnectionBase>): Promise<DiscordConnection | null> {
        const connectionBase = await findOne<DiscordConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new DiscordConnection(connectionBase);
    }

    static async findActiveOne(filter: Filter<DiscordConnectionBase>): Promise<DiscordConnection | null> {
        const activeFilter = {...filter, active: true};
        return DiscordConnection.findOne(activeFilter);
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

    static async update(filter: Filter<DiscordConnectionBase>, updateData: Partial<DiscordConnectionBase>): Promise<void> {
        await update<DiscordConnectionBase>("connections", filter, updateData);
    }

    // static Discord only methods
    static async channelAccessible(client: Client, channelId: Snowflake): Promise<boolean> {
        try {
            return (await client.channels.fetch(channelId)) !== null;
        } catch (e) {
            return false;
        }
    }

    // dynamic methods
    async isIncludes(): Promise<boolean> {
        return DiscordConnection.isIncludes(this.getBase());
    }

    async register(): Promise<boolean> {
        if (!(await DiscordConnection.isIncludes({_id: this._id}))) {
            await insertOne<DiscordConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        return deleteMany<DiscordConnectionBase>("connections", this.getBase());
    }

    async update(filter: Filter<DiscordConnectionBase>): Promise<this> {
        await update<DiscordConnectionBase>("connections", filter, this.getBase());
        return this;
    }

    // dynamic Discord only methods
    async channelAccessible(client: Client): Promise<boolean> {
        return DiscordConnection.channelAccessible(client, this.data.channelId);
    }

    // creater
    fromConnection(connection: Connection): DiscordConnection {
        const connectionBase = connection.getBase();
        Object.assign(this, connectionBase);
        return this;
    }

    fromConnectionBase(connectionBase: ConnectionBase) {
        this._id = connectionBase._id;
        this.clusterId = connectionBase.clusterId;
        this.name = connectionBase.name;
        this.active = connectionBase.active;
        return this;
    }

    // get / set
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

    getConnectionBase(): ConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
        };
    }

    setChannelId(channelId: Snowflake) {
        this.data.channelId = channelId;
        return this;
    }

    setChannelWebhook(channelWebhook: Snowflake) {
        this.data.channelWebhook = channelWebhook;
        return this;
    }
}

export {DiscordConnection};
export {DiscordConnectionBase};
