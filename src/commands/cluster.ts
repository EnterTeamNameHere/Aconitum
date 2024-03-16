import type {APIEmbedField, ChatInputCommandInteraction} from "discord.js";
import {  EmbedBuilder,PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Cluster} from "../classes/cluster.js";
import {Commands} from "../interfaces/command";
import {checkStringId} from "../utils/db.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("create-cluster")
            .setDescription("クラスターを作成します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-name").setDescription("クラスターの名前").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const clusterName = interaction.options.getString("cluster-name", true);
                const clusterId = new ObjectId();
                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const cluster = new Cluster({
                    _id: clusterId,
                    guildIds: [guildId],
                    name: clusterName,
                    active: true,
                });
                await cluster.register();
                await interaction.editReply(`クラスター ${clusterName} を作成しました\nID: ${clusterId.toString()}`);
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("invite-server")
            .setDescription("クラスターにサーバーを追加します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("server-id").setDescription("サーバーのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const senderGuild = interaction.guild;
                if (senderGuild === null) {
                    throw new Error("Interaction's guild is null");
                }
                const clusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(clusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const cluster = await Cluster.findOne({_id: new ObjectId(clusterId)});
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }
                const receiverGuildId = interaction.options.getString("server-id", true);
                if (!(await Cluster.checkGuildId(clusterId, receiverGuildId))) {
                    await interaction.editReply("Aconitumは指定されたサーバーに参加していません");
                    return;
                }

                const receiverGuild = await interaction.client.guilds.fetch(receiverGuildId);
                const announce = receiverGuild.systemChannel;
                if (announce === null) {
                    await interaction.editReply("招待を送信できませんでした");
                    return;
                }

                const fealds: Array<APIEmbedField> = [
                    {name: "クラスター名", value: cluster.name},
                    {name: "サーバー名", value: senderGuild.name},
                ];
                const embet = new EmbedBuilder().setColor(0x777777).setFields(fealds);
                await announce.send({content: "クラスターへの招待が届いています！", embeds: [embet]});
                cluster.addInviteList(receiverGuildId);
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
];

export default commands;
