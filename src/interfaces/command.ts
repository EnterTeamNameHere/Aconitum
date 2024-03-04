import {CommandInteraction, SlashCommandBuilder} from "discord.js";

type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
    global: boolean;
};
type Commands = Array<Command>;
export {Command, Commands};