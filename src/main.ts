import {Client, Events, GatewayIntentBits} from "discord.js";

import config from "../env/config.json";

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async () => {
    console.log("Ready");
    console.log(client);
});

client.login(config.token);
