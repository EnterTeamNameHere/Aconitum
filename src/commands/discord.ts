import {ChannelType, SlashCommandBuilder, TextChannel} from "discord.js";
import {ObjectId} from "mongodb";

import type {Commands} from "../interfaces/command.js";
import type {DiscordConnection} from "../interfaces/dbInterfaces.js";
import clusterData from "../utils/clusterData.js";
import connectionData from "../utils/connectionData.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("discord-connect")
            .setDescription("Discordのチャンネルを接続します")
            .setDMPermission(false)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("connection-name").setDescription("接続の名前").setRequired(true))
            .addChannelOption(option =>
                option.setName("channel").setDescription("チャンネル").setRequired(false).addChannelTypes(ChannelType.GuildText),
            ),
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
                const connectionBase = await connectionData.createConnectionData(interaction, "discord");
                if (connectionBase === null) {
                    return;
                }
                const webhook = (
                    await channel.createWebhook({
                        name: interaction.options.getString("connection-name") as string,
                        reason: "Created by Aconitum",
                    })
                ).url;
                const connection: DiscordConnection = {
                    ...connectionBase,
                    platform: "discord",
                    data: {
                        channelId: channel.id,
                        channelWebhook: webhook,
                    },
                };

                await connectionData.register<DiscordConnection>(connection);
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
        global: false,
    },
];

export default commands;
