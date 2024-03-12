import type {Snowflake} from "discord-api-types/globals.js";
import {Filter, ObjectId} from "mongodb";

import type {Cluster} from "../interfaces/dbInterfaces.js";

import {deleteMany, find, findOne, isIncludes, updateOrInsert} from "./db.js";

export default {
    find: async function f(filter: Filter<Cluster>): Promise<Array<Cluster>> {
        return find<Cluster>("clusters", filter);
    },

    findOne: async function f(filter: Filter<Cluster>): Promise<Cluster | null> {
        return findOne<Cluster>("clusters", filter);
    },

    register: async function f(cluster: Cluster): Promise<void> {
        await updateOrInsert<Cluster>("clusters", {name: cluster.name}, cluster);
    },

    remove: async function f(clusterId: ObjectId): Promise<void> {
        await deleteMany<Cluster>("clusters", {_id: clusterId});
    },

    checkGuildId: async function f(clusterId: string, guildId: Snowflake): Promise<boolean> {
        const clusterObjectId = new ObjectId(clusterId);
        if (await isIncludes<Cluster>("clusters", {_id: clusterObjectId})) {
            const cluster = await findOne<Cluster>("clusters", {_id: clusterObjectId});
            if (cluster !== null) {
                return cluster.guildId === guildId;
            }
            return false;
        }
        return false;
    },
};
