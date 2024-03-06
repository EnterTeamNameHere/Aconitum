import {ChannelType, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";

import type {Commands} from "../interfaces/command.js";
import {insert} from "../utils/connectionData.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("create-connection")
            .setDescription("コネクションを作成します")
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("メッセージを出力するチャンネル")
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText),
            )
            .setDMPermission(false),
        async execute(interaction: ChatInputCommandInteraction) {
            await interaction.deferReply({ephemeral: true});
            const id = (
                await insert(interaction.guildId!, interaction.options.getChannel("channel")?.id ?? interaction.channelId)
            ).toHexString();
            await interaction.editReply(`コネクションを作成しました\nID: ${id}`);
        },
        global: true,
    },
];

export default commands;
