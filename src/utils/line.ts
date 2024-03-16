import {EventEmitter} from "node:events";

import lineSDK from "@line/bot-sdk";
import { match, replace, test, trim } from "ramda";

export const lineEventEmitter = new EventEmitter({captureRejections: true});

export default {
    /* LINE -> Discord */
    platformEventHandler: async (client: lineSDK.Client, event: lineSDK.WebhookEvent): Promise<void> => {
        if (event.type === "message" && event.message.type === "text") {
            lineEventEmitter.emit("textMessageCreate", event);

            const commandLikeMessage = replace(/ +/g, " ", trim(event.message.text));
            if (test(/aconitum.auth [0-9]{6}/, commandLikeMessage) && event.source.type === "group") {
                lineEventEmitter.emit("auth", match(/[0-9]{6}/, commandLikeMessage)[0], event.source.groupId);
            }
        }
    },

    /* Discord -> LINE */
    discordEventHandler: async () => {
        /* TODO */
    },
};
