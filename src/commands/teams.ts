import axios from "axios";
import {ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder} from "discord.js";

import {Commands} from "../interfaces/command";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("teams-connect")
            .setDescription("Teamsのチャンネルを接続します")
            .addChannelOption(option => option.setName("discord-channel").setDescription("Discord側のチャンネル").setRequired(true))
            .addStringOption(option => option.setName("teams-webhook").setDescription("Teams側のWebhook").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            // const discordChannel = interaction.options.getChannel("discord-channel", true);
            const teamsWebhook = interaction.options.getString("teams-webhook", true);
            console.log(teamsWebhook);
            await axios.post(teamsWebhook, {text: "this is test message"}).then(res => console.log(res.data));
            await interaction.reply("sent");
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
