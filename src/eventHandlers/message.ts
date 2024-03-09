import {Events} from "discord.js";

import Procs from "../interfaces/eventHandler.js";

const procs: Procs = function execute(client): void {
    client.on<Events.MessageCreate>(Events.MessageCreate, async message => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        await (async function teamsReacter(guildId, channelId, cleanContent, attachments) {
            // TODO
        })(message.guild, message.channelId, message.cleanContent, message.attachments);
    });
};

export default procs;
