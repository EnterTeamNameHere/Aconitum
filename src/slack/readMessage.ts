/* eslint-disable */
import {WebClient, LogLevel} from "@slack/web-api";
import config from "../utils/envConf.js";

const client = new WebClient(config.slackToken, {logLevel: LogLevel.DEBUG});

try {
    const channelId;
    // Call the conversations.history method using WebClient
    const result = await client.conversations.history({
        channel: channelId,
        limit: 1,
    });

    const conversationHistory = result.messages;
} catch (error) {
    console.error(error);
}
