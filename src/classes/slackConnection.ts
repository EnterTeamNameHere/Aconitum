import type {Filter, ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes, update} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type SlackConnectionBase = ConnectionBase & {
    platform: "slack";
    data: {
        send: string;
        recv: string;
    };
};

class SlackConnection extends Connection implements SlackConnectionBase {
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

    // static methods
    static async find(filter: Filter<SlackConnectionBase>): Promise<Array<SlackConnection>> {
        const connectionBases = await find<SlackConnectionBase>("connections", filter);
        const connections = new Array<SlackConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new SlackConnection(connectionBase));
        }
        return connections;
    }

    static async findActive(filter: Filter<SlackConnectionBase>): Promise<Array<SlackConnection>> {
        const activeFilter = {...filter, active: true};
        return SlackConnection.find(activeFilter);
    }

    static async findOne(filter: Filter<SlackConnectionBase>): Promise<SlackConnection | null> {
        const connectionBase = await findOne<SlackConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new SlackConnection(connectionBase);
    }

    static async findActiveOne(filter: Filter<SlackConnectionBase>): Promise<SlackConnection | null> {
        const activeFilter = {...filter, active: true};
        return SlackConnection.findOne(activeFilter);
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

    static fromConnection(connection: Connection): SlackConnectionBase {
        const connectionBase = connection.getBase();
        return new SlackConnection({...connectionBase, platform: "slack"});
    }

    static async update(filter: Filter<SlackConnectionBase>, updateData: Partial<SlackConnectionBase>): Promise<void> {
        await update<SlackConnectionBase>("connections", filter, updateData);
    }

    // dynamic methods
    async isIncludes(): Promise<boolean> {
        return SlackConnection.isIncludes(this.getBase());
    }

    async register(): Promise<boolean> {
        if (!(await SlackConnection.isIncludes({_id: this._id}))) {
            await insertOne<SlackConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        return deleteMany<SlackConnectionBase>("connections", this.getBase());
    }

    async update(filter: Filter<SlackConnectionBase>): Promise<void> {
        await SlackConnection.update(filter, this.getBase());
    }

    // creater
    fromConnection(connection: Connection) {
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

    getConnectionBase(): ConnectionBase {
        return {
            _id: this._id,
            clusterId: this.clusterId,
            name: this.name,
            platform: this.platform,
            active: this.active,
        };
    }

    setSend(value: string) {
        this.data.send = value;
        return this;
    }

    setRecv(value: string) {
        this.data.recv = value;
        return this;
    }
}

export {SlackConnection};
export {SlackConnectionBase};
