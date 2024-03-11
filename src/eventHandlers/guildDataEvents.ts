import {Events, Guild} from "discord.js";

import Procs from "../interfaces/eventHandler.js";
import guildData from "../utils/guildData.js";

const procs: Procs = function execute(client): void {
    client.on<Events.GuildCreate>(Events.GuildCreate, async (guild: Guild) => {
        await guildData.register(guild.id);
    });

    client.on<Events.GuildDelete>(Events.GuildDelete, async (guild: Guild) => {
        await guildData.remove(guild.id);
    });
};

export default procs;
