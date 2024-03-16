import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Cluster} from "../classes/cluster.js";
import {Connection} from "../classes/connection.js";
import {LineConnection} from "../classes/lineConnection.js";
import {Commands} from "../interfaces/command.js";
import {lineEventEmitter} from "../utils/line.js";
import {autoDeleteMessage} from "../utils/tools.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("line-connect")
            .setDescription("LINEのグループを接続します")
            .setDMPermission(false)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("connection-name").setDescription("接続の名前").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                /* init */
                await interaction.deferReply({ephemeral: true});
                const commandOption = {
                    clusterId: interaction.options.getString("cluster-id", true),
                    connectionName: interaction.options.getString("connection-name", true),
                };

                /* get cluster */
                const cluster = await Cluster.findOne({_id: new ObjectId(commandOption.clusterId)});
                if (cluster === null) {
                    throw new Error("clusterId is null");
                }

                /* auth */
                const authNumber = Math.floor(Math.random() * 1000000)
                    .toString()
                    .padStart(6, "0");
                await interaction.editReply({
                    content: `接続したいLINEグループ内で、以下のテキストを60秒以内に送信してください。\`\`\`aconitum.auth ${authNumber}\`\`\``,
                });
                const authEvent = new Promise<string>(resolve => {
                    lineEventEmitter.on("auth", (num: string, groupId: string) => {
                        if (num === authNumber) {
                            resolve(groupId);
                        }
                    });
                });
                const authTimeout = new Promise<string>((_, reject) => {
                    setTimeout(reject, 60000, "timeout");
                });
                const groupId = await Promise.race([authEvent, authTimeout]);

                /* create connection */
                const connectionBase = await Connection.createConnectionData(interaction);
                if (connectionBase === null) {
                    return;
                }
                const connection: LineConnection = new LineConnection({
                    ...connectionBase,
                    _id: new ObjectId(),
                    platform: "line",
                    data: {
                        groupId,
                    },
                });
                await connection.register();

                await interaction.editReply({content: "接続しました。"});
            } catch (e) {
                console.error(`[ERR]: ${e}`);
                const {channel} = interaction;
                if (!channel) {
                    return;
                }
                const errorMessage = e === "timeout" ? "操作がタイムアウトしました。" : "実行中にエラーが発生しました。";
                if (interaction.isRepliable()) {
                    if (interaction.deferred) {
                        await interaction.editReply({content: errorMessage});
                    } else {
                        await interaction.reply({content: errorMessage});
                    }
                } else {
                    await autoDeleteMessage(channel, errorMessage, 5);
                }
            }
        },
        global: true,
    },
];

export default commands;
