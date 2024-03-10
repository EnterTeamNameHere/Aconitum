import {Filter, ObjectId} from "mongodb";

import type {Connection} from "../interfaces/dbInterfaces.js";

import { deleteMany, find, updateOrInsert } from "./db.js";

export default {
    find: async function f<PlatformConnection extends Connection = Connection>(
        filter: Filter<PlatformConnection>,
    ): Promise<Array<PlatformConnection>> {
        return find<PlatformConnection>("connections", filter);
    },

    register: async function f<PlatformConnection extends Connection>(connection: PlatformConnection): Promise<void> {
        await updateOrInsert<Connection>("connections", {platform: connection.platform, name: connection.name}, connection);
    },

    remove: async function f(connectionId: ObjectId): Promise<void> {
        await deleteMany<Connection>("connections", {_id: connectionId});
    },
};
