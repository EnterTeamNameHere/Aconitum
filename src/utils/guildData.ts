import type {ObjectId} from "mongodb";

import {Guild} from "../interfaces/dbInterfaces.js";

import {deleteMany, insertOne} from "./db.js";

const insert = async function f(guildId: string) {
    const insertData: Guild = {
        guildId,
        connections: new Array<ObjectId>(),
    };
    await insertOne<Guild>("guild", insertData);
};

const remove = async function f(guildId: string) {
    const filter = {
        guildId,
    };
    await deleteMany<Guild>("guild", filter);
};

export {insert, remove};
