import lineSDK from "@line/bot-sdk";

export default {
    /* LINE -> Discord */
    platformEventHandler: async (client: lineSDK.Client, event: lineSDK.WebhookEvent): Promise<void> => {
        if (event.type === "message" && event.message.type === "text") {
            const response: lineSDK.TextMessage = {
                type: "text",
                text: event.message.text,
            };
            await client.replyMessage(event.replyToken, response);
        }
    },

    /* Discord -> LINE */
    discordEventHandler: async () => {
        /* TODO */
    },
};
