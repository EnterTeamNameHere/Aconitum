import { ObjectId} from "mongodb";
import type {Filter} from "mongodb";

import { deleteMany, find, findOne, isIncludes, updateOrInsert } from "../utils/db.js";

import {Connection } from "./connection.js";
import type {ConnectionBase} from "./connection.js";

type LineConnectionBase = ConnectionBase & {
    platform: "line";
    data: {
        id: string;
        token: string;
    };
};

class LineConnection extends Connection<LineConnectionBase> implements LineConnectionBase {
    platform: "line";
    data: {
        id: string;
        token: string;
    };

    constructor(connection: Partial<LineConnectionBase>) {
        super(connection);
        this.platform = "line";
        this.data = {
            id: "",
            token: "",
        };
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

    static async findOne(filter: Filter<LineConnectionBase>): Promise<LineConnection | null> {
        const connectionBase = await findOne<LineConnectionBase>("connections", filter);
        if (connectionBase === null) {
            return null;
        }
        return new LineConnection(connectionBase);
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

    async find(): Promise<Array<LineConnection>> {
        return LineConnection.find({_id: this._id});
    }

    async findOne(): Promise<LineConnection | null> {
        return LineConnection.findOne({_id: this._id});
    }

    async isIncludes(): Promise<boolean> {
        return isIncludes<LineConnectionBase>("connections", this.getBase());
    }

    async register(): Promise<void> {
        return updateOrInsert<LineConnectionBase>(
            "connections",
            {
                platform: this.platform,
                name: this.name,
            },
            this.getBase(),
        );
    }

    async remove(): Promise<void> {
        return deleteMany<LineConnectionBase>("connections", this.getBase());
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

    setId(value: ObjectId): void {
        this._id = value;
    }

    getId(): ObjectId {
        return this._id;
    }

    setToken(value: string): void {
        this.data.token = value;
    }

    getToken(): string {
        return this.data.token;
    }
}

export {LineConnection};
export {LineConnectionBase};
