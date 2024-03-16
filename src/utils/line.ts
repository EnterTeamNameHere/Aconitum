import {EventEmitter} from "node:events";

import lineSdk from "@line/bot-sdk";
import discordSdk from "discord.js";
import R from "ramda";


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
                const commandLikeMessage = R.replace(/ +/g, " ", R.trim(event.message.text));
                if (R.test(/aconitum.auth [0-9]{6}/, commandLikeMessage)) {
                    lineEventEmitter.emit("auth", R.match(/[0-9]{6}/, commandLikeMessage)[0], event.source.groupId);
                }
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
