import {Filter, MongoClient} from "mongodb";

import config from "./envConf.js";

const client = new MongoClient(config.db);
async function find<DocumentType extends Document>(collectionName: string, filter: Filter<DocumentType>): Promise<Array<DocumentType>> {
    const collection = client.db("Aconitum").collection<DocumentType>(collectionName);
    return collection.find<DocumentType>(filter).toArray();
}
// eslint-disable-next-line
export {find};
