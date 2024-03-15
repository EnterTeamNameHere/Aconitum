import axios from "axios";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    CommandInteraction,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import type {ModalActionRowComponentBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {TeamsConnection } from "../classes/teamsConnection.js";
import type {TeamsConnectionBase} from "../classes/teamsConnection.js";
import {Commands} from "../interfaces/command.js";
import {deleteMany, insertOne, update} from "../utils/db.js";
import {autoDeleteMessage} from "../utils/tools.js";

type ModalData = TeamsConnectionBase & {authNumber: string; timestamp: Date};

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("teams-connect")
            .setDescription("Teamsのチャンネルを接続します")
            .setDMPermission(false)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("teams-webhook").setDescription("Teams側のWebhookURI").setRequired(true))
            .addStringOption(option => option.setName("connection-name").setDescription("接続の名前").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            // 以下、ラグが発生してDiscord側でエラー吐くので意図的にキモい処理順序になってます
            try {
                const authNumber = Math.floor(Math.random() * 1000000)
                    .toString()
                    .padStart(6, "0");
                const tmpModalData: ModalData = {
                    _id: new ObjectId(),
                    clusterId: new ObjectId(),
                    name: "",
                    platform: "teams",
                    active: false,
                    data: {
                        sendWebhook: "",
                    },
                    authNumber,
                    timestamp: new Date(),
                };
                await insertOne<ModalData>("connectionCaches", tmpModalData);

                const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder().setCustomId("authNumber").setLabel("6桁の認証番号").setStyle(TextInputStyle.Short),
                );
                const modal = new ModalBuilder()
                    .setCustomId(`teams-auth:${tmpModalData._id.toHexString()}`)
                    .setTitle("Teams認証")
                    .addComponents(actionRow);
                await interaction.showModal(modal);

                const teamsWebhook = interaction.options.getString("teams-webhook", true);
                const connectionBase = await Connection.createConnectionData(interaction);
                if (connectionBase === null) {
                    return;
                }
                const connection: TeamsConnection = new TeamsConnection({
                    ...connectionBase,
                    _id: tmpModalData._id,
                    platform: "teams",
                    data: {
                        sendWebhook: teamsWebhook,
                    },
                });

                const cluster = await Cluster.findOne({_id: new ObjectId(interaction.options.getString("cluster-id", true))});
                if (cluster === null) {
                    throw new Error("cluster not found");
                }

                const modalData = {
                    ...connection,
                    authNumber,
                };
                await update<ModalData>("connectionCaches", tmpModalData, {$set: modalData});

                const message = {
                    text: `Aconitumがこのチャンネルをクラスター"${cluster.name}"に追加しようとしています。\n以下の番号をDiscordに入力してください: ${authNumber}`,
                };
                try {
                    await axios.post(teamsWebhook, message);
                    await new Promise(resolve => {
                        setTimeout(resolve, 60000);
                    });
                    await deleteMany<ModalData>("connectionCaches", {_id: modalData._id});
                } catch (e) {
                    await interaction.editReply("WebhookのURIが間違っています。");
                    await deleteMany<ModalData>("connectionCaches", {_id: modalData._id});
                }
            } catch (e) {
                console.error(`[ERR]: ${e}`);
                const {channel} = interaction;
                if (!channel) {
                    return;
                }
                if (interaction.isRepliable()) {
                    if (interaction.deferred) {
                        await interaction.editReply({content: "実行中にエラーが発生しました。"});
                    } else {
                        await interaction.reply({content: "実行中にエラーが発生しました。"});
                    }
                } else {
                    await autoDeleteMessage(channel, "実行中にエラーが発生しました。", 5);
                }
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder().setName("teams-disconnect").setDescription("Teamsのチャンネルを切断します"),
        async execute(interaction: CommandInteraction) {
            await interaction.deferReply({ephemeral: true});
            await interaction.editReply("not impremented yet");
        },
        global: true,
    },
];

export default commands;
