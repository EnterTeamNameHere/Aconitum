// import {type Client, WebhookClient, type WebhookMessageCreateOptions} from "discord.js";
// import type {ObjectId} from "mongodb";
// import {channel} from "node:diagnostics_channel";
// import discord from "../commands/discord.js";
//
// import type {Connection, DiscordConnection} from "../interfaces/dbInterfaces.js";
// import connectionData from "./connectionData.js";
//
//
// export class UnityMessage {
//     private readonly client: Client;
//     private connection: Connection ;
//     private connectionId: ObjectId;
//     private content: string = "";
//     private username: string|undefined = undefined;
//     private icon: string|undefined = undefined;
//     private attachments: Array<string> = [];
//
//     constructor(client: Client) {
//         this.client = client;
//     }
//
//     async sendDiscord(){
//     const discordConnections = await connectionData.activeFind<DiscordConnection>({
//             platform: "discord",
//             clusterId: this.connection.clusterId,
//         });
//     for (const discordConnection of discordConnections) {
//             try{
//                 if(!await connectionData.checkDiscord(this.client, discordConnection.data.channelId)){
//                     await connectionData.remove(discordConnection._id);
//                     continue;
//                 }
//
//                 const webhookClient = new WebhookClient({url: discordConnection.data.channelWebhook});
//                 const message: WebhookMessageCreateOptions = {
//                     avatarURL: this.icon,
//                     username: this.username,
//                     content: this.content,
//                 }
//             } catch (e){
//             }
//         }
//     }
// }
