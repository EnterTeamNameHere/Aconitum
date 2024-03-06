import type {Client, Snowflake} from "discord.js";
import {ObjectId} from "mongodb";

import type {Connection} from "../interfaces/dbInterfaces.js";

import {deleteMany, find, insertOne} from "./db.js";

const insert = async function f(guildId: Snowflake, channelId: Snowflake): Promise<ObjectId> {
    const id = new ObjectId();
    const insertData: Connection = {
        _id: id,
        teams: {
            send: "",
            recv: "",
            active: false,
        },
        line: {
            id: "",
            token: "",
            active: false,
        },
        slack: {
            send: "",
            recv: "",
            active: false,
        },
        guild: guildId,
        channel: channelId,
        webhook: "", // For the future
    };
    await insertOne<Connection>("connection", insertData);
    return id;
};

const remove = async function f(connectionId: ObjectId) {
    const filter = {
        _id: connectionId,
    };
    await deleteMany<Connection>("connection", filter);
};

const removeGuild = async function f(guildId: Snowflake) {
    const filter = {
        guild: guildId,
    };
    await deleteMany<Connection>("connection", filter);
};

const startUp = async function f(client: Client) {
    try {
        for (const collection of await find<Connection>("connection", {})) {
            if (client.channels.cache.get(collection.channel) === undefined) {
                await remove(collection._id as ObjectId);
            }
        }
    } catch (e) {
        console.error("Error occurred at start.");
        throw e;
    }
};

export {insert, remove, removeGuild, startUp};
