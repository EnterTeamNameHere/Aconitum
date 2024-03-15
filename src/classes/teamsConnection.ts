import type {Filter, ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type TeamsConnectionBase = ConnectionBase & {
    platform: "teams";
    data: {
        sendWebhook: string;
    };
};

class TeamsConnection extends Connection<TeamsConnectionBase> implements TeamsConnectionBase {
    platform = "teams" as const;
    data: {
        sendWebhook: string;
    } = {
        sendWebhook: "",
    };

    constructor(connection?: Partial<TeamsConnectionBase>) {
        super(connection);
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    static async find(filter: Filter<TeamsConnectionBase>): Promise<Array<TeamsConnection>> {
        const connectionBases = await find<TeamsConnectionBase>("connections", filter);
        const connections = new Array<TeamsConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new TeamsConnection(connectionBase));
        }
        return connections;
    }

    static async findOne(filter: Filter<TeamsConnectionBase>): Promise<TeamsConnection | null> {
        const connectionBase = await findOne<TeamsConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new TeamsConnection(connectionBase);
    }

    static async isIncludes(filter: Filter<TeamsConnectionBase>): Promise<boolean> {
        return isIncludes<TeamsConnectionBase>("connections", filter);
    }

    static async remove(connectionId: ObjectId): Promise<void> {
        await deleteMany<TeamsConnectionBase>("connections", {_id: connectionId});
    }

    static async removeCluster(clusterId: ObjectId): Promise<void> {
        await deleteMany<TeamsConnectionBase>("connections", {clusterId});
    }

    getBase(): TeamsConnectionBase {
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
        return isIncludes<TeamsConnectionBase>("connections", this.getBase());
    }

    async register(): Promise<boolean> {
        if (await this.isIncludes()) {
            await insertOne<TeamsConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        return deleteMany<TeamsConnectionBase>("connections", this.getBase());
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

    setSendWebhook(sendWebhook: string): void {
        this.data.sendWebhook = sendWebhook;
    }

    getSendWebhook(): string {
        return this.data.sendWebhook;
    }
}

export {TeamsConnection};
export {TeamsConnectionBase};
