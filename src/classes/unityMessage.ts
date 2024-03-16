import axios from "axios";
import type {APIEmbedField, Client, WebhookMessageCreateOptions} from "discord.js";
import {  AttachmentBuilder ,EmbedBuilder, WebhookClient} from "discord.js";
import {ObjectId} from "mongodb";

import type {Connections, Platform} from "./connection.js";
import {Connection} from "./connection.js";
import {DiscordConnection} from "./discordConnection.js";
import {TeamsConnection} from "./teamsConnection.js";

export type attachment = {
    name: string;
    url: string;
    type: string | undefined;
};

export type UnityMessageBase<ConnectionType extends Connection = Connection> = {
    platform: Platform;
    connection: ConnectionType;
    guildname: string | undefined;
    channelName: string | undefined;
    username: string | undefined;
    icon: string | undefined;
    content: string;
    images: Array<attachment>;
    files: Array<attachment>;
};

export class UnityMessage<ConnectionType extends Connections> implements UnityMessageBase {
    client: Client;
    platform: Platform = "uncategorized";
    connection: ConnectionType;
    guildname: string | undefined = undefined;
    channelName: string | undefined = undefined;
    username: string | undefined = undefined;
    icon: string | undefined = undefined;
    content: string = "";
    images: Array<attachment> = [];
    files: Array<attachment> = [];

    constructor(client: Client, connection: ConnectionType, base?: UnityMessageBase) {
        this.client = client;
        this.connection = connection;
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
        const discordConnections = await this.sendingDiscordChannels();
        for (const discordConnection of discordConnections) {
            try {
                if (!(await discordConnection.channelAccessible(this.client))) {
                    await discordConnection.remove();
                    continue;
                }

                const webhookClient = new WebhookClient({url: discordConnection.data.channelWebhook});
                const fealds: Array<APIEmbedField> = new Array<APIEmbedField>();
                fealds.push({name: "Platform", value: this.platform});
                if (this.guildname) {
                    fealds.push({name: "Guild", value: this.guildname});
                }
                if (this.channelName) {
                    fealds.push({name: "Channel", value: this.channelName});
                }
                const message: WebhookMessageCreateOptions = {
                    avatarURL: this.icon,
                    username: this.username,
                    content: this.content,
                    files: this.getAttachments().map<AttachmentBuilder>(
                        attachment => new AttachmentBuilder(attachment.url, {name: attachment.name}),
                    ),
                    embeds: [new EmbedBuilder().setColor(0x777777).setFields(fealds)],
                };

                await webhookClient.send(message);
            } catch (e) {
                console.error(`[err]: ${e}`);
            }
        }
    }

    async sendTeams() {
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

        const teamsConnections = await this.sendingTeamsChannels();
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
        return this;
    }

    setConnection(connection: ConnectionType) {
        this.connection = connection;
        return this;
    }

    setConnectionId(connectionId: ObjectId) {
        this.connection._id = connectionId;
        return this;
    }

    setGuildName(guildname: string | undefined) {
        this.guildname = guildname;
        return this;
    }

    setChannelName(channelName: string | undefined) {
        this.channelName = channelName;
        return this;
    }

    setUsername(username: string | undefined) {
        this.username = username;
        return this;
    }

    setIcon(icon: string | undefined) {
        this.icon = icon;
        return this;
    }

    setContent(content: string) {
        this.content = content;
        return this;
    }

    addImage(image: attachment) {
        this.images.push(image);
        return this;
    }

    addFile(attachment: attachment) {
        this.files.push(attachment);
        return this;
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

    protected async sendingDiscordChannels(): Promise<Array<DiscordConnection>> {
        return DiscordConnection.find({
            platform: "discord",
            clusterId: this.connection.clusterId,
            active: true,
        });
    }

    protected async sendingTeamsChannels(): Promise<Array<TeamsConnection>> {
        return TeamsConnection.find({
            platform: "teams",
            clusterId: this.connection.clusterId,
            active: true,
        });
    }
}
