import {Client, Events, GatewayIntentBits} from "discord.js";

import config from "./envConf.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async () => {
    console.log("Ready");
    console.log(config);
});

client.login(config.token);
