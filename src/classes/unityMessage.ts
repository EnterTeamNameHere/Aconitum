import axios from "axios";
import {AttachmentBuilder,  WebhookClient } from "discord.js";
import type {Client, WebhookMessageCreateOptions} from "discord.js";
import {ObjectId} from "mongodb";

import type {Connections, Platform} from "./connection.js";
import {Connection} from "./connection.js";
import {DiscordConnection} from "./discordConnection.js";
import {TeamsConnection} from "./teamsConnection.js";

export type attachment = {
    name: string;
    url: string;
};

export type UnityMessageBase = {
    platform: Platform;
    connection: Connections;
    guildname: string | undefined;
    channelName: string | undefined;
    username: string | undefined;
    icon: string | undefined;
    content: string;
    images: Array<attachment>;
    files: Array<attachment>;
};

export class UnityMessage implements UnityMessageBase {
    client: Client;
    platform: Platform = "uncategorized";
    connection: Connections = new Connection();
    guildname: string | undefined = undefined;
    channelName: string | undefined = undefined;
    username: string | undefined = undefined;
    icon: string | undefined = undefined;
    content: string = "";
    images: Array<attachment> = [];
    files: Array<attachment> = [];

    constructor(client: Client, base?: UnityMessageBase) {
        this.client = client;
        if (base) {
            Object.assign(this, base);
        }
    }

    get ConnectionId() {
        return this.connection._id;
    }

    set ConnectionId(connectionId: ObjectId) {
        this.connection._id = connectionId;
    }

    async sendDiscord() {
        const discordConnections = await DiscordConnection.find({
            platform: "discord",
            clusterId: this.connection.clusterId,
        });
        for (const discordConnection of discordConnections) {
            try {
                if (!(await discordConnection.channelAccessible(this.client))) {
                    await discordConnection.remove();
                    continue;
                }

                const webhookClient = new WebhookClient({url: discordConnection.data.channelWebhook});
                const message: WebhookMessageCreateOptions = {
                    avatarURL: this.icon,
                    username: this.username,
                    content: this.content,
                    files: this.getAttachments().map<AttachmentBuilder>(
                        attachment => new AttachmentBuilder(attachment.url, {name: attachment.name}),
                    ),
                };

                await webhookClient.send(message);
            } catch (e) {
                console.error(`[err]: ${e}`);
            }
        }
    }

    async sendTeams() {
        const teamsConnections = await TeamsConnection.find({
            platform: "teams",
            clusterId: this.connection.clusterId,
        });
        const messageCard = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            summary: "Discordからのメッセージを受信しました",
            sections: [
                {
                    activityImage: this.icon,
                    activityTitle: this.username,
                    activitySubtitle: `at \`#${this.channelName}\` in \`${this.guildname}\``,
                    activityText: this.content,
                    images: this.images.map(image => ({
                        image: image.url,
                        title: image.name,
                    })),
                    text: this.files.map(file => `- [${file.name}](${file.url})\n`).join("\n"),
                },
            ],
            themeColor: "9B59B6",
        };
        for (const teamsConnection of teamsConnections) {
            try {
                const webhookURI = teamsConnection.data.sendWebhook;
                await axios.post(webhookURI, messageCard);
            } catch (e) {
                console.error(`[err]: ${e}`);
            }
        }
    }

    async sendAll() {
        await this.sendDiscord();
        await this.sendTeams();
    }

    setPlatform(platform: Platform) {
        this.platform = platform;
    }

    setConnection(connection: Connections) {
        this.connection = connection;
    }

    setConnectionId(connectionId: ObjectId) {
        this.connection._id = connectionId;
    }

    setContent(content: string) {
        this.content = content;
    }

    setUsername(username: string) {
        this.username = username;
    }

    setIcon(icon: string) {
        this.icon = icon;
    }

    addImage(image: attachment) {
        this.images.push(image);
    }

    addFile(attachment: attachment) {
        this.files.push(attachment);
    }

    getAttachments() {
        return this.images.concat(this.files);
    }

    getBase(): UnityMessageBase {
        return {
            platform: this.platform,
            connection: this.connection,
            guildname: this.guildname,
            channelName: this.channelName,
            username: this.username,
            icon: this.icon,
            content: this.content,
            images: this.images,
            files: this.files,
        };
    }
}
