import {REST}                                            from "discord.js"
import {RequestData, RestEventsMap, RouteLike}           from "@discordjs/rest";
import {ApplicationCommand} from "discord-api-types/v10";
import {AsyncEventEmitter}                               from "@vladfrangu/async_event_emitter";

declare module "discord.js"{
    class REST extends AsyncEventEmitter<RestEventsMap> {
        get(fullRoute: `/applications/${string}/commands`): Promise<Array<ApplicationCommand>>;
    }
}