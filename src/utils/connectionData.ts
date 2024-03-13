import type {ChatInputCommandInteraction} from "discord.js";
import {Filter, ObjectId} from "mongodb";

import type {Connection} from "../interfaces/dbInterfaces.js";

import clusterData from "./clusterData.js";
import {checkStringId, deleteMany, find as findDoc, findOne as findOneDoc, updateOrInsert} from "./db.js";

const find = async function f<PlatformConnection extends Connection = Connection>(
    filter: Filter<PlatformConnection>,
): Promise<Array<PlatformConnection>> {
    return findDoc<PlatformConnection>("connections", filter);
};

const findOne = async function f<PlatformConnection extends Connection = Connection>(
    filter: Filter<PlatformConnection>,
): Promise<PlatformConnection | null> {
    return findOneDoc<PlatformConnection>("connections", filter);
};

const register = async function f<PlatformConnection extends Connection>(connection: PlatformConnection): Promise<void> {
    await updateOrInsert<Connection>("connections", {platform: connection.platform, name: connection.name}, connection);
};

const remove = async function f(connectionId: ObjectId): Promise<void> {
    await deleteMany<Connection>("connections", {_id: connectionId});
};

const removeCluster = async function f(clusterId: ObjectId): Promise<void> {
    await deleteMany<Connection>("connections", {clusterId});
};

const createConnectionData = async function f(interaction: ChatInputCommandInteraction): Promise<Connection | null> {
    const result = await (async (): Promise<Connection | string> => {
        const clusterId = interaction.options.getString("cluster-id", true);
        if (!(await checkStringId(clusterId))) {
            return "クラスターIDが不適切です。";
        }
        const clusterObjectId = new ObjectId(clusterId);
        const connectionName = interaction.options.getString("connection-name", true);
        const {guildId} = interaction;
        if (guildId === null) {
            throw new Error("Interaction's guildId is null");
        }
        if (!(await clusterData.checkGuildId(clusterId, guildId))) {
            return "指定されたクラスターが見つかりませんでした。";
        }

        return {
            _id: new ObjectId(),
            clusterId: clusterObjectId,
            name: connectionName,
            platform: "uncategorized",
            active: true,
        };
    })();

    if (typeof result === "string") {
        const {deferred, channel} = interaction;
        const repliable = interaction.isRepliable();
        if (repliable) {
            if (deferred) {
                await interaction.editReply(result);
            } else {
                await interaction.reply(result);
            }
        } else if (channel) {
            await channel.send(result);
        }
        return null;
    }
    return result;
};

export default {find, findOne, register, remove, removeCluster, createConnectionData};
