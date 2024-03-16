import type {Snowflake} from "discord-api-types/globals.js";
import { DiscordAPIError} from "discord.js";
import type {Client} from "discord.js";
import type {Filter} from "mongodb";
import {ObjectId} from "mongodb";

import {deleteMany, find, findOne, insertOne, isIncludes, update} from "../utils/db.js";

export type ClusterBase = {
    _id: ObjectId;
    guildIds: Array<Snowflake>;
    inviteList: Array<Snowflake>;
    name: string;
    active: boolean;
};

export class Cluster implements ClusterBase {
    _id: ObjectId = new ObjectId();
    guildIds: Array<Snowflake> = new Array<Snowflake>();
    inviteList: Array<Snowflake> = new Array<Snowflake>();
    name: string = "";
    active: boolean = false;

    constructor(cluster?: Partial<ClusterBase>) {
        if (cluster) {
            Object.assign(this, cluster);
        }
    }

    // static methods
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

    static async update(filter: Filter<ClusterBase>, updateData: Partial<ClusterBase>): Promise<void> {
        await update<ClusterBase>("clusters", filter, updateData);
    }

    static async checkGuildId(clusterId: string, guildId: Snowflake): Promise<boolean> {
        const clusterObjectId = new ObjectId(clusterId);
        const cluster = await Cluster.findOne({_id: clusterObjectId});
        if (cluster !== null) {
            return cluster.guildIds.includes(guildId);
        }
        return false;
    }

    static async guildAccessible(client: Client, guildId: Snowflake): Promise<boolean> {
        try {
            const guildData = await client.guilds.fetch(guildId);
            return !!guildData;
        } catch (e) {
            if (e instanceof DiscordAPIError && e.code === 10004) {
                return false;
            }
            throw e;
        }
    }

    // dynamic methods
    async isIncludes(): Promise<boolean> {
        return isIncludes<ClusterBase>("clusters", this.getBase());
    }

    async register(): Promise<boolean> {
        if (!(await Cluster.isIncludes({_id: this._id}))) {
            await insertOne<ClusterBase>("clusters", this.getBase());
            return true;
        }
        return false;
    }

    async remove(): Promise<void> {
        await deleteMany<ClusterBase>("clusters", this.getBase());
    }

    async update(filter: Filter<ClusterBase>): Promise<this> {
        await update<ClusterBase>("clusters", filter, this.getBase());
        return this;
    }

    // set / get
    getBase(): ClusterBase {
        return {
            _id: this._id,
            guildIds: this.guildIds,
            inviteList: this.inviteList,
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

    setGuildId(guildIds: Array<Snowflake>) {
        this.guildIds = guildIds;
        return this;
    }

    addGuildId(guildId: Snowflake) {
        this.guildIds.push(guildId);
        return this;
    }

    removeGuildId(guildId: Snowflake) {
        this.guildIds = this.guildIds.filter(id => id !== guildId);
        return this;
    }

    setInviteList(inviteList: Array<Snowflake>) {
        this.inviteList = inviteList;
        return this;
    }

    addInviteList(invite: Snowflake) {
        this.inviteList.push(invite);
        return this;
    }

    removeInviteList(invite: Snowflake) {
        this.inviteList = this.inviteList.filter(id => id !== invite);
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
