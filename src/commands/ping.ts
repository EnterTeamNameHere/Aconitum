import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {Commands} from "../interfaces/command";

export const commands: Commands =[
    {
        data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("ping"),
        async execute(interaction: CommandInteraction) {
            await interaction.reply(`Ping : ${interaction.client.ws.ping}ms`);
        },
        global: true
    }
];