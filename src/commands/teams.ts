import {ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Commands} from "../interfaces/command";
import {TeamsConnection} from "../interfaces/dbInterfaces.js";
import connectionData from "../utils/connectionData.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("teams-connect")
            .setDescription("Teamsのチャンネルを接続します")
            .setDMPermission(false)
            .addChannelOption(option => option.setName("discord-channel").setDescription("Discord側のチャンネル").setRequired(true))
            .addStringOption(option => option.setName("teams-webhook").setDescription("Teams側のWebhookURI").setRequired(true))
            .addStringOption(option => option.setName("connection-name").setDescription("接続の名前").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                /* get options */
                const discordChannel = interaction.options.getChannel("discord-channel", true).toString();
                const teamsWebhook = interaction.options.getString("teams-webhook", true);
                const connectionName = interaction.options.getString("connection-name", true);

                /* register connection data */
                if (interaction.guildId === null) {
                    throw new Error("guildId is null");
                }
                const connection: TeamsConnection = {
                    _id: new ObjectId(),
                    guildId: interaction.guildId,
                    channelId: discordChannel.replace(/\D/g, ""),
                    name: connectionName,
                    platform: "teams",
                    data: {
                        sendWebhook: teamsWebhook,
                    },
                };
                await connectionData.register<TeamsConnection>(connection);

                await interaction.reply({content: "登録しました．", ephemeral: true});
            } catch (e) {
                await interaction.reply({content: "実行中にエラーが発生しました．", ephemeral: true});
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder().setName("teams-disconnect").setDescription("Teamsのチャンネルを切断します"),
        async execute(interaction: CommandInteraction) {
            await interaction.reply("not impremented yet");
        },
        global: true,
    },
];

export default commands;
