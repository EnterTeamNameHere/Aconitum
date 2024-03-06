import {Events, Guild} from "discord.js";

import Procs from "../interfaces/clientProcs.js";
import {insert} from "../utils/guildData.js";

const procs: Procs = function execute(client): void {
    client.on<Events.GuildCreate>(Events.GuildCreate, async (guild: Guild) => {
        await insert(guild.id);
    });
};

export default procs;
