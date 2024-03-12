import {ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Commands} from "../interfaces/command";
import {TeamsConnection} from "../interfaces/dbInterfaces.js";
import clusterData from "../utils/clusterData.js";
import connectionData from "../utils/connectionData.js";

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
            try {
                await interaction.deferReply({ephemeral: true});

                const teamsWebhook = interaction.options.getString("teams-webhook", true);

                const connectionBase = await connectionData.createConnectionData(interaction, "teams");
                if (connectionBase === null) {
                    return;
                }
                const connection: TeamsConnection = {
                    ...connectionBase,
                    platform: "teams",
                    data: {
                        sendWebhook: teamsWebhook,
                    },
                };
                await connectionData.register<TeamsConnection>(connection);

                const cluster = await clusterData.findOne({_id: new ObjectId(interaction.options.getString("cluster-id", true))});
                if (cluster === null) {
                    throw new Error("cluster not found");
                }
                await interaction.editReply({
                    content: `${interaction.options.getString("connection-name")}をクラスター${cluster.name}に登録しました。`,
                });
            } catch (e) {
                await interaction.editReply({content: "実行中にエラーが発生しました．"});
                console.error(`[ERR]: ${e}`);
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
