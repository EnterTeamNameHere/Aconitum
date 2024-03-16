import type {ChatInputCommandInteraction} from "discord.js";
import { PermissionFlagsBits,SlashCommandBuilder} from "discord.js";
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

                const clusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(clusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const guildId = interaction.options.getString("server-id", true);
                if (!(await Cluster.checkGuildId(clusterId, guildId))) {
                    await interaction.editReply("指定されたクラスターが見つかりませんでした");
                    
                }
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
];

export default commands;
