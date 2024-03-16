import type {Filter, ObjectId, UpdateFilter} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes, update} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type TeamsConnectionBase = ConnectionBase & {
    platform: "teams";
    data: {
        sendWebhook: string;
    };
};

class TeamsConnection extends Connection implements TeamsConnectionBase {
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

    // static methods
    static async find(filter: Filter<TeamsConnectionBase>): Promise<Array<TeamsConnection>> {
        const connectionBases = await find<TeamsConnectionBase>("connections", filter);
        const connections = new Array<TeamsConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new TeamsConnection(connectionBase));
        }
        return connections;
    }

    static async findActive(filter: Filter<TeamsConnectionBase>): Promise<Array<TeamsConnection>> {
        const activeFilter = {...filter, active: true};
        return TeamsConnection.find(activeFilter);
    }

    static async findOne(filter: Filter<TeamsConnectionBase>): Promise<TeamsConnection | null> {
        const connectionBase = await findOne<TeamsConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new TeamsConnection(connectionBase);
    }

    static async findActiveOne(filter: Filter<TeamsConnectionBase>): Promise<TeamsConnection | null> {
        const activeFilter = {...filter, active: true};
        return TeamsConnection.findOne(activeFilter);
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

    static fromConnection(connection: Connection): TeamsConnection {
        const connectionBase = connection.getBase();
        return new TeamsConnection({...connectionBase, platform: "teams"});
    }

    static async update(
        filter: Filter<TeamsConnectionBase>,
        updateData: UpdateFilter<TeamsConnectionBase> | Array<TeamsConnectionBase>,
    ): Promise<void> {
        await update<TeamsConnectionBase>("connections", filter, updateData);
    }

    // dynamic methods
    async isIncludes(): Promise<boolean> {
        return TeamsConnection.isIncludes(this.getBase());
    }

    async register(): Promise<boolean> {
        if (!(await TeamsConnection.isIncludes({_id: this._id}))) {
            await insertOne<TeamsConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        await TeamsConnection.remove(this._id);
    }

    async update(filter: Filter<TeamsConnectionBase> = {_id: this._id}): Promise<TeamsConnection> {
        await update<TeamsConnectionBase>("connections", filter, {$set: this.getBase()});
        return this;
    }

    // creater
    fromConnection(connection: Connection): TeamsConnection {
        const connectionBase = connection.getBase();
        Object.assign(this, connectionBase);
        return this;
    }

    setConnectionBase(connectionBase: ConnectionBase) {
        this._id = connectionBase._id;
        this.clusterId = connectionBase.clusterId;
        this.name = connectionBase.name;
        this.active = connectionBase.active;
        return this;
    }

    // get / set
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

    getConnectionBase(): ConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
        };
    }

    setSendWebhook(sendWebhook: string) {
        this.data.sendWebhook = sendWebhook;
        return this;
    }
}

export {TeamsConnection};
export {TeamsConnectionBase};
