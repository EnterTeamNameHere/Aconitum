import {RestEventsMap} from "@discordjs/rest";
import {AsyncEventEmitter} from "@vladfrangu/async_event_emitter";
import {ApplicationCommand} from "discord-api-types/v10";
// import {REST} from "discord.js";

declare module "discord.js" {
    class REST extends AsyncEventEmitter<RestEventsMap> {
        get(fullRoute: `/applications/${string}/commands`): Promise<Array<ApplicationCommand>>;
    }
}
