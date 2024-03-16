import type {ChatInputCommandInteraction} from "discord.js";
import {SlashCommandBuilder} from "discord.js";

import {Commands} from "../interfaces/command.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder().setName("ping").setDescription("ping"),
        async execute(interaction: ChatInputCommandInteraction) {
            await interaction.reply(`Ping : ${interaction.client.ws.ping}ms`);
        },
        global: true,
    },
];

export default commands;
