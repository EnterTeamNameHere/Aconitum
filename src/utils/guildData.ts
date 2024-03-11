import {ObjectId} from "mongodb";

import {Connection, Guild} from "../interfaces/dbInterfaces.js";

import { deleteMany, find, findOne, insertOne, isIncludes } from "./db.js";

export default {
    findAll: async function f(): Promise<Array<Guild>> {
        return find<Guild>("guilds", {});
    },

    findUnique: async function f(guildId: string): Promise<Guild> {
        const result = await findOne<Guild>("guilds", {guildId});
        if (result === null) {
            throw new Error(`guild ${guildId} not found`);
        }
        return result;
    },

    register: async function f(guildId: string): Promise<void> {
        if (!(await isIncludes<Guild>("guilds", {guildId}))) {
            const guild: Guild = {
                _id: new ObjectId(),
                guildId,
            };
            await insertOne("guilds", guild);
        }
    },

    remove: async function f(guildId: string): Promise<void> {
        await deleteMany<Guild>("guilds", {guildId});
        await deleteMany<Connection>("connections", {guildId});
    },
};
