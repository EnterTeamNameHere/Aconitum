import {EventEmitter} from "node:events";

import lineSdk from "@line/bot-sdk";
import discordSdk from "discord.js";
import {isEmpty, isNotNil, match, replace, test, trim} from "ramda";

import {LineConnection} from "../classes/lineConnection.js";
import {LineMessage} from "../classes/lineMessage.js";

export const lineEventEmitter = new EventEmitter({captureRejections: true});

export default {
    /* LINE -> Discord */
    platformEventHandler: async (
        discordClient: discordSdk.Client,
        lineClient: lineSdk.Client,
        event: lineSdk.WebhookEvent,
    ): Promise<void> => {
        try {
            if (
                event.type === "message" &&
                event.message.type === "text" &&
                event.source.type === "group" &&
                isNotNil(event.source.userId)
            ) {
                const groupSummary = await lineClient.getGroupSummary(event.source.groupId);
                const userProfile = await lineClient.getProfile(event.source.userId);

                const commandLikeMessage = replace(/ +/g, " ", trim(event.message.text));
                if (test(/aconitum.auth [0-9]{6}/, commandLikeMessage)) {
                    lineEventEmitter.emit("auth", match(/[0-9]{6}/, commandLikeMessage)[0], groupSummary.groupId);
                }

                const connections = await LineConnection.findActive({"data.groupId": groupSummary.groupId});
                if (isEmpty(connections)) {
                    return;
                }
                for (const connection of connections) {
                    const lineMessage = new LineMessage(discordClient)
                        .setConnection(connection)
                        .setGuildName(groupSummary.groupName)
                        .setChannelName("(group)")
                        .setUsername(userProfile.displayName)
                        .setIcon(userProfile.pictureUrl)
                        .setContent(event.message.text);
                    lineMessage.sendAll();
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
