import {CommandInteraction, Events, Interaction} from "discord.js";

import Procs from "../interfaces/clientProcs.js";
import commandList from "../main.js";

const procs: Procs = function execute(client): void {
    async function commandProcess(interaction: CommandInteraction) {
        const {commandName} = interaction;
        const command = commandList.get(commandName);
        if (command) {
            await command.execute(interaction);
        } else {
            console.error(`The Command ${commandName} is not available`);
        }
    }

    client.on<Events.InteractionCreate>(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await commandProcess(interaction);
        }
    });
};

export default procs;
