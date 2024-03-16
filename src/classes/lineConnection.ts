import {ObjectId} from "mongodb";
import type {Filter, UpdateFilter} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes, update} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type LineConnectionBase = ConnectionBase & {
    platform: "line";
    data: {
        groupId: string;
    };
};

class LineConnection extends Connection implements LineConnectionBase {
    platform = "line" as const;
    data: {
        groupId: string;
    } = {
        groupId: "",
    };

    constructor(connection?: Partial<LineConnectionBase>) {
        super(connection);
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    // static methods
    static async find(filter: Filter<LineConnectionBase>): Promise<Array<LineConnection>> {
        const connectionBases = await find<LineConnectionBase>("connections", filter);
        const connections = new Array<LineConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new LineConnection(connectionBase));
        }
        return connections;
    }

    static async findActive(filter: Filter<LineConnectionBase>): Promise<Array<LineConnection>> {
        const activeFilter = {...filter, active: true};
        return LineConnection.find(activeFilter);
    }

    static async findOne(filter: Filter<LineConnectionBase>): Promise<LineConnection | null> {
        const connectionBase = await findOne<LineConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new LineConnection(connectionBase);
    }

    static async findActiveOne(filter: Filter<LineConnectionBase>): Promise<LineConnection | null> {
        const activeFilter = {...filter, active: true};
        return LineConnection.findOne(activeFilter);
    }

    static async isIncludes(filter: Filter<LineConnectionBase>): Promise<boolean> {
        return isIncludes<LineConnectionBase>("connections", filter);
    }

    static async remove(connectionId: ObjectId): Promise<void> {
        await deleteMany<LineConnectionBase>("connections", {_id: connectionId});
    }

    static async removeCluster(clusterId: ObjectId): Promise<void> {
        await deleteMany<LineConnectionBase>("connections", {clusterId});
    }

    static fromConnection(connection: Connection): LineConnectionBase {
        const connectionBase = connection.getBase();
        return new LineConnection({...connectionBase, platform: "line"});
    }

    static async update(
        filter: Filter<LineConnectionBase>,
        updateData: UpdateFilter<LineConnectionBase> | Array<LineConnectionBase>,
    ): Promise<void> {
        await update<LineConnectionBase>("connections", filter, updateData);
    }

    // dynamic methods
    async isIncludes(): Promise<boolean> {
        return LineConnection.isIncludes(this.getBase());
    }

    async register(): Promise<boolean> {
        if (!(await LineConnection.isIncludes({_id: this._id}))) {
            await insertOne<LineConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        await LineConnection.remove(this._id);
    }

    async update(filter: Filter<LineConnectionBase> = {_id: this._id}): Promise<this> {
        await LineConnection.update(filter, {$set: this.getBase()});
        return this;
    }

    // creater
    fromConnection(connection: Connection): LineConnection {
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
    getBase(): LineConnectionBase {
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

    setGroupId(value: string) {
        this.data.groupId = value;
        return this;
    }

    getGroupId(): string {
        return this.data.groupId;
    }
}

export {LineConnection};
export {LineConnectionBase};
