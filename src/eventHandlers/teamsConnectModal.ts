import {Events} from "discord.js";
import {ObjectId} from "mongodb";

import { TeamsConnection} from "../interfaces/dbInterfaces.js";
import type {Connection} from "../interfaces/dbInterfaces.js";
import type Procs from "../interfaces/eventHandler.js";
import clusterData from "../utils/clusterData.js";
import connectionData from "../utils/connectionData.js";
import {deleteMany, findOne} from "../utils/db.js";

type ModalData = Connection & {authNumber: string};

const procs: Procs = function execute(client): void {
    client.on<Events.InteractionCreate>(Events.InteractionCreate, async interaction => {
        if (interaction.isModalSubmit()) {
            if (interaction.customId.substring(0, 11) === "teams-auth:") {
                try {
                    await interaction.deferReply({ephemeral: true});
                    const modalDataId = new ObjectId(interaction.customId.substring(11));
                    let modalData = await findOne<ModalData>("connectionCaches", {_id: modalDataId});
                    if (modalData === null) {
                        await interaction.editReply("タイムアウトしました。");
                        return;
                    }

                    const enterdAuthNumber = interaction.fields.getTextInputValue("authNumber");
                    if (enterdAuthNumber !== modalData.authNumber) {
                        await interaction.editReply("認証番号が一致しません。");
                        return;
                    }

                    for (let i = 0; i < 60; i++) {
                        if (modalData.active) {
                            break;
                        }
                        await new Promise(resolve => {
                            setTimeout(resolve, 1000);
                        });
                        modalData = await findOne<ModalData>("connectionCaches", {_id: modalDataId});
                        if (modalData === null) {
                            await interaction.editReply("タイムアウトしました。");
                            return;
                        }
                        if (i === 59) {
                            await interaction.editReply("タイムアウトしました。");
                            return;
                        }
                    }
                    await deleteMany<ModalData>("connectionCaches", {_id: modalDataId});

                    const connection = Object.assign(modalData);
                    connection._id = new ObjectId();
                    delete connection.authNumber;
                    await connectionData.register<TeamsConnection>(connection);

                    const cluster = await clusterData.findOne({_id: connection.clusterId});
                    if (cluster === null) {
                        throw new Error("cluster not found");
                    }
                    await interaction.editReply({
                        content: `${connection.name}をクラスター${cluster.name}に登録しました。`,
                    });
                } catch (e) {
                    await interaction.editReply("実行中にエラーが発生しました。");
                    console.error(`[ERR]: ${e}`);
                }
            }
        }
    });
};

export default procs;
