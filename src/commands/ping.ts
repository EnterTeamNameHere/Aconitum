import {CommandInteraction, SlashCommandBuilder, SlashCommandStringOption} from "discord.js";

export = [
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