import {SlashCommandBuilder} from "discord.js";
import type {ChatInputCommandInteraction} from "discord.js";
import {ObjectId} from "mongodb";

import {Commands} from "../interfaces/command";
import type {Cluster} from "../interfaces/dbInterfaces.js";
import clusterData from "../utils/clusterData.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("create-cluster")
            .setDescription("クラスターを作成します")
            .setDMPermission(false)
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
                const cluster: Cluster = {
                    _id: clusterId,
                    guildId,
                    name: clusterName,
                };
                await clusterData.register(cluster);

                await interaction.editReply(`クラスター ${clusterName} を作成しました\nID: ${clusterId.toString()}`);
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
];

export default commands;
