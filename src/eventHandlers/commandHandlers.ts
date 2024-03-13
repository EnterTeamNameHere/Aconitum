import type {ChatInputCommandInteraction} from "discord.js";
import {Events, Interaction} from "discord.js";

import commandList from "../index.js";
import Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    async function commandProcess(interaction: ChatInputCommandInteraction) {
        const {commandName} = interaction;
        const command = commandList.get(commandName);
        if (command) {
            await command.execute(interaction);
        } else {
            console.error(`The Command ${commandName} is not available`);
        }
    }

    client.on<Events.InteractionCreate>(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            await commandProcess(interaction);
        }
    });
};

export default procs;
