import type {Client, Snowflake} from "discord.js";
import {DiscordAPIError} from "discord.js";
import {ObjectId} from "mongodb";

import {Guild} from "../interfaces/dbInterfaces.js";

import {removeGuild} from "./connectionData.js";
import {deleteMany, find, insertOne, isIncludes} from "./db.js";

const insert = async function f(guildId: Snowflake): Promise<ObjectId> {
    const id = new ObjectId();
    const insertData: Guild = {
        _id: id,
        guildId,
        connections: new Array<ObjectId>(),
    };
    await insertOne<Guild>("guild", insertData);
    return id;
};

const remove = async function f(guildId: Snowflake) {
    const filter = {
        guildId,
    };
    await deleteMany<Guild>("guild", filter);
};

const startUp = async function f(client: Client) {
    try {
        for (const guild of await find<Guild>("guild", {})) {
            try {
                await client.guilds.fetch(guild.guildId);
            } catch (e) {
                if (e instanceof DiscordAPIError && (e.code === 10004 || e.code === "10004")) {
                    await remove(guild.guildId);
                    await removeGuild(guild.guildId);
                } else {
                    throw e;
                }
            }
        }

        const guilds = client.guilds.cache;
        for (const guild of guilds.keys()) {
            if (!(await isIncludes<Guild>("guild", {guildId: guild}))) {
                await insert(guild);
            }
        }
    } catch (e) {
        console.error("Error occurred at start.");
        throw e;
    }
};

export {insert, remove, startUp};
