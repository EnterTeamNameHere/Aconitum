import {EventEmitter} from "node:events";

import lineSdk from "@line/bot-sdk";
import discordSdk from "discord.js";
import { match, replace, test, trim } from "ramda";
// Ramda.js document https://ramdajs.com/docs/
// import {LineMessage} from "../classes/lineMessage.js";

export const lineEventEmitter = new EventEmitter({captureRejections: true});

export default {
    /* LINE -> Discord */
    platformEventHandler: async (
        discordClient: discordSdk.Client,
        lineClient: lineSdk.Client,
        event: lineSdk.WebhookEvent,
    ): Promise<void> => {
        try {
            if (event.type === "message" && event.message.type === "text" && event.source.type === "group") {
                const commandLikeMessage = replace(/ +/g, " ", trim(event.message.text));
                if (test(/aconitum.auth [0-9]{6}/, commandLikeMessage)) {
                    lineEventEmitter.emit("auth", match(/[0-9]{6}/, commandLikeMessage)[0], event.source.groupId);
                }

                // help me
                // const lineMessage = new LineMessage(discordClient);
                // lineMessage.sendDiscord();
            }
        } catch (err) {
            console.error(`[ERR]: ${err}`);
        }
    },

    /* Discord -> LINE */
    discordEventHandler: async () => {
        /* TODO */
    },
};
