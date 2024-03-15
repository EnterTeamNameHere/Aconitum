import type {Document, MatchKeysAndValues, OptionalUnlessRequiredId, UpdateFilter} from "mongodb";
import {Filter, MongoClient} from "mongodb";

import type {CollectionName} from "../classes/connection.js";

import config from "./envConf.js";

let client = new MongoClient(config.db);
const db = client.db("Aconitum");

function errorHandler(error: unknown): unknown {
    console.error(error);
    return error;
}

const find = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
): Promise<Array<DocumentType>> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        return await collection.find<DocumentType>(filter).toArray();
    } catch (e) {
        throw errorHandler(e);
    }
};

const findOne = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
): Promise<DocumentType | null> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        return await collection.findOne<DocumentType>(filter);
    } catch (e) {
        throw errorHandler(e);
    }
};

const isIncludes = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
): Promise<boolean> {
    try {
        const found = await find<DocumentType>(collectionName, filter);
        return found.length > 0;
    } catch (e) {
        throw errorHandler(e);
    }
};

const update = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
    updateData: UpdateFilter<DocumentType> | Array<Document>,
): Promise<void> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        await collection.updateOne(filter, updateData);
        console.log("Collection update is successful");
    } catch (e) {
        throw errorHandler(e);
    }
};

const insertOne = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    document: OptionalUnlessRequiredId<DocumentType>,
): Promise<void> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        await collection.insertOne(document);
        console.log("Document insert is successful");
    } catch (e) {
        throw errorHandler(e);
    }
};

const insertMany = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    document: Array<OptionalUnlessRequiredId<DocumentType>>,
): Promise<void> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        await collection.insertMany(document);
        console.log("Documents insert is successful");
    } catch (e) {
        throw errorHandler(e);
    }
};

const updateOrInsert = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
    document: OptionalUnlessRequiredId<DocumentType>,
) {
    try {
        if (await isIncludes(collectionName, filter)) {
            await update(collectionName, filter, {$set: document as MatchKeysAndValues<DocumentType>});
        } else {
            await insertOne(collectionName, document);
        }
    } catch (e) {
        throw errorHandler(e);
    }
};

const deleteMany = async function f<DocumentType extends Document>(
    collectionName: CollectionName,
    filter: Filter<DocumentType>,
): Promise<void> {
    try {
        const collection = db.collection<DocumentType>(collectionName);
        await collection.deleteMany(filter);
        console.log("Documents delete is successful");
    } catch (e) {
        throw errorHandler(e);
    }
};

const open = async function f() {
    client = new MongoClient(config.db);
    console.log("DB client is opened");
};

const close = async function f() {
    await client.close();
    console.log("DB client is closed");
};

const checkStringId = async function f(id: string) {
    if (id.match(/^[A-Za-z0-9]*$/) && id.length === 24) {
        return true;
    }
    return false;
};

export {find, findOne, isIncludes, update, insertOne, insertMany, updateOrInsert, deleteMany, open, close, checkStringId};
