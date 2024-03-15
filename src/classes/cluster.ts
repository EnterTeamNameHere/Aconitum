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
    _id: ObjectId = new ObjectId("");
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

    static async findOne(filter: Filter<ClusterBase>): Promise<Cluster | null> {
        const clusterBase = await findOne<ClusterBase>("clusters", filter);
        if (clusterBase === null) {
            return null;
        }
        return new Cluster(clusterBase);
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

    getStringId() {
        return this._id.toHexString();
    }

    getBase(): ClusterBase {
        return {
            _id: this._id,
            guildId: this.guildId,
            name: this.name,
            active: this.active,
        };
    }

    setStringId(id?: string) {
        this._id = new ObjectId(id);
        return this._id;
    }

    async isIncludes(): Promise<boolean> {
        return isIncludes<ClusterBase>("clusters", this.getBase());
    }

    async register(): Promise<void> {
        await insertOne<ClusterBase>("clusters", this.getBase());
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

    setGuildId(guildId: Snowflake) {
        this.guildId = guildId;
    }

    getGuildId() {
        return this.guildId;
    }

    setName(name: string) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setActive(active: boolean) {
        this.active = active;
    }

    getActive() {
        return this.active;
    }
}
