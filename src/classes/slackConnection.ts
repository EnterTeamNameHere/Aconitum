import type {Filter, ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type SlackConnectionBase = ConnectionBase & {
    platform: "slack";
    data: {
        send: string;
        recv: string;
    };
};

class SlackConnection extends Connection<SlackConnectionBase> implements SlackConnectionBase {
    platform = "slack" as const;
    data: {
        send: string;
        recv: string;
    } = {
        send: "",
        recv: "",
    };

    constructor(connection?: Partial<SlackConnectionBase>) {
        super(connection);
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    static async find(filter: Filter<SlackConnectionBase>): Promise<Array<SlackConnection>> {
        const connectionBases = await find<SlackConnectionBase>("connections", filter);
        const connections = new Array<SlackConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new SlackConnection(connectionBase));
        }
        return connections;
    }

    static async findOne(filter: Filter<SlackConnectionBase>): Promise<SlackConnection | null> {
        const connectionBase = await findOne<SlackConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new SlackConnection(connectionBase);
    }

    static async isIncludes(filter: Filter<SlackConnectionBase>): Promise<boolean> {
        return isIncludes<SlackConnectionBase>("connections", filter);
    }

    static async remove(connectionId: ObjectId): Promise<void> {
        await deleteMany<SlackConnectionBase>("connections", {_id: connectionId});
    }

    static async removeCluster(clusterId: ObjectId): Promise<void> {
        await deleteMany<SlackConnectionBase>("connections", {clusterId});
    }

    getBase(): SlackConnectionBase {
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
        return isIncludes<SlackConnectionBase>("connections", this.getBase());
    }

    async register(): Promise<boolean> {
        if (await this.isIncludes()) {
            await insertOne<SlackConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        return deleteMany<SlackConnectionBase>("connections", this.getBase());
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

    setSend(value: string): void {
        this.data.send = value;
    }

    getSend(): string {
        return this.data.send;
    }

    setRecv(value: string): void {
        this.data.recv = value;
    }

    getRecv(): string {
        return this.data.recv;
    }
}

export {SlackConnection};
export {SlackConnectionBase};
