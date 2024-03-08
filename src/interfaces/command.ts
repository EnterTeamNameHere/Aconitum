import {SlashCommandBuilder} from "discord.js";
import type {ChatInputCommandInteraction} from "discord.js";

type Command = {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    global: boolean;
};
type Commands = Array<Command>;
export {Command, Commands};
