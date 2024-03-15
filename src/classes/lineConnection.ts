import {ObjectId} from "mongodb";
import type {Filter} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes} from "../utils/db.js";

import {Connection} from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type LineConnectionBase = ConnectionBase & {
    platform: "line";
    data: {
        id: string;
        token: string;
    };
};

class LineConnection extends Connection implements LineConnectionBase {
    platform = "line" as const;
    data: {
        id: string;
        token: string;
    } = {
        id: "",
        token: "",
    };

    constructor(connection?: Partial<LineConnectionBase>) {
        super(connection);
        if (connection) {
            Object.assign(this.data, connection.data);
        }
    }

    static async find(filter: Filter<LineConnectionBase>): Promise<Array<LineConnection>> {
        const connectionBases = await find<LineConnectionBase>("connections", filter);
        const connections = new Array<LineConnection>();
        for (const connectionBase of connectionBases) {
            connections.push(new LineConnection(connectionBase));
        }
        return connections;
    }

    static async findActive(filter: Filter<LineConnectionBase>): Promise<Array<LineConnection>> {
        const activeFilter = filter;
        activeFilter.active = true;
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
        const activeFilter = filter;
        activeFilter.active = true;
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

    async isIncludes(): Promise<boolean> {
        return isIncludes<LineConnectionBase>("connections", this.getBase());
    }

    async register(): Promise<boolean> {
        if (await this.isIncludes()) {
            await insertOne<LineConnectionBase>("connections", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        return deleteMany<LineConnectionBase>("connections", this.getBase());
    }

    fromConnection(connection: Connection): LineConnection {
        const connectionBase = connection.getBase();
        Object.assign(this, connectionBase);
        return this;
    }

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

    setToken(value: string) {
        this.data.token = value;
        return this;
    }
}

export {LineConnection};
export {LineConnectionBase};
