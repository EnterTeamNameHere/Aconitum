/* eslint-disable */
import {ChannelType, SlashCommandBuilder, TextChannel} from "discord.js";
import {ObjectId} from "mongodb";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {SlackConnection} from "../classes/slackConnection.js";
import type {Commands} from "../interfaces/command.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("slack-connect")
            .setDescription("Slackのチャンネルを接続します")
            .setDMPermission(false)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("connection-name").setDescription("接続の名前").setRequired(true))
            .addStringOption(option => option.setName("slack-webhook").setDescription("Slack側のWebhookURL").setRequired(true))
            .addStringOption(option => option.setName("slack-channelID").setDescription("SlackのチャンネルID").setRequired(true)),
        async execute(interaction) {
            try {
                await interaction.deferReply({ephemeral: true});

                if (!interaction.channel?.isTextBased()) {
                    throw new Error("channel is not text based");
                }

                /* get options */
                const channel =
                    interaction.options.getChannel("channel", false, [ChannelType.GuildText]) ??
                    (interaction.channel as TextChannel | null);
                if (channel === null) {
                    throw new Error("channel is null");
                }
                const connectionBase = await Connection.createConnectionData(interaction);
                if (connectionBase === null) {
                    return;
                }
                const webhook = (
                    await channel.createWebhook({
                        name: interaction.options.getString("connection-name") as string,
                        reason: "Created by Aconitum",
                    })
                ).url;
                const connection: SlackConnection = new SlackConnection({
                    ...connectionBase,
                    platform: "slack",
                    data: {},
                });

                await connection.register();
                const cluster = await Cluster.findOne({_id: new ObjectId(interaction.options.getString("cluster-id", true))});
                if (cluster === null) {
                    throw new Error("cluster not found");
                }
                await interaction.editReply({
                    content: `${interaction.options.getString("connection-name")}をクラスター${cluster.name}に登録しました。`,
                });
                await slackChannel.editReply({
                    content: `${interaction.options.getString("slack-channelID")}`,
                });
            } catch (e) {
                await interaction.editReply({content: "実行中にエラーが発生しました。"});
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
];

export default commands;
