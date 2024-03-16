import type {Snowflake} from "discord-api-types/globals.js";
import type {Filter} from "mongodb";
import {ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes} from "../utils/db.js";

export type ClusterBase = {
    _id: ObjectId;
    guildId: Snowflake;
    name: string;
    active: boolean;
};

export class Cluster implements ClusterBase {
    _id: ObjectId = new ObjectId();
    guildId: Snowflake = "";
    name: string = "";
    active: boolean = false;

    constructor(cluster?: Partial<ClusterBase>) {
        if (cluster) {
            Object.assign(this, cluster);
        }
    }

    static async find(filter: Filter<ClusterBase>): Promise<Array<Cluster>> {
        const clusterBases = await find<ClusterBase>("clusters", filter);
        const clusters = new Array<Cluster>();
        for (const clusterBase of clusterBases) {
            clusters.push(new Cluster(clusterBase));
        }
        return clusters;
    }

    static async findActive(filter: Filter<ClusterBase>): Promise<Array<Cluster>> {
        const activeFilter = filter;
        activeFilter.active = true;
        return Cluster.find(activeFilter);
    }

    static async findOne(filter: Filter<ClusterBase>): Promise<Cluster | null> {
        const clusterBase = await findOne<ClusterBase>("clusters", filter);
        if (clusterBase === null) {
            return null;
        }
        return new Cluster(clusterBase);
    }

    static async findActiveOne(filter: Filter<ClusterBase>): Promise<Cluster | null> {
        const activeFilter = filter;
        activeFilter.active = true;
        return Cluster.findOne(activeFilter);
    }

    static async isIncludes(filter: Filter<ClusterBase>): Promise<boolean> {
        return isIncludes<ClusterBase>("clusters", filter);
    }

    static async remove(clusterId: ObjectId): Promise<void> {
        await deleteMany<ClusterBase>("clusters", {_id: clusterId});
    }

    static async checkGuildId(clusterId: string, guildId: Snowflake): Promise<boolean> {
        const clusterObjectId = new ObjectId(clusterId);
        const cluster = await Cluster.findOne({_id: clusterObjectId});
        if (cluster !== null) {
            return cluster.guildId === guildId;
        }
        return false;
    }

    async isIncludes(): Promise<boolean> {
        return isIncludes<ClusterBase>("clusters", this.getBase());
    }

    async register(): Promise<boolean> {
        if (await this.isIncludes()) {
            await insertOne<ClusterBase>("clusters", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        await deleteMany<ClusterBase>("clusters", this.getBase());
    }

    async checkGuildId(guildId: Snowflake): Promise<boolean> {
        if (await this.isIncludes()) {
            if (await this.isIncludes()) {
                return this.guildId === guildId;
            }
            return false;
        }
        return false;
    }

    getBase(): ClusterBase {
        return {
            _id: this._id,
            guildId: this.guildId,
            name: this.name,
            active: this.active,
        };
    }

    setId(id: ObjectId) {
        this._id = id;
        return this;
    }

    setStringId(id?: string) {
        this._id = new ObjectId(id);
        return this;
    }

    getStringId() {
        return this._id.toHexString();
    }

    setGuildId(guildId: Snowflake) {
        this.guildId = guildId;
        return this;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setActive(active: boolean) {
        this.active = active;
        return this;
    }
}
