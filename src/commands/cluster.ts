import type {APIEmbedField, ChatInputCommandInteraction} from "discord.js";
import {EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {ObjectId} from "mongodb";

import {Cluster} from "../classes/cluster.js";
import {Commands} from "../interfaces/command";
import {checkStringId} from "../utils/db.js";

const commands: Commands = [
    {
        data: new SlashCommandBuilder()
            .setName("create-cluster")
            .setDescription("クラスターを作成します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-name").setDescription("クラスターの名前").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const clusterName = interaction.options.getString("cluster-name", true);
                const clusterId = new ObjectId();
                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const cluster = new Cluster({
                    _id: clusterId,
                    guildIds: [guildId],
                    name: clusterName,
                    active: true,
                });
                await cluster.register();
                await interaction.editReply(`クラスター ${clusterName} を作成しました\nID: ${clusterId.toString()}`);
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("cluster-list")
            .setDescription("クラスターのリストを表示します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const clusters = await Cluster.findActive({guildIds: {$elemMatch: {$eq: guildId}}});
                const fields = new Array<{
                    name: string;
                    value: string;
                }>();
                for (const cluster of clusters) {
                    fields.push({name: cluster.name, value: cluster.getStringId()});
                }
                if (fields.length === 0) {
                    await interaction.reply("クラスターはありません");
                    return;
                }
                await interaction.editReply({
                    content: "クラスターのリスト",
                    embeds: [new EmbedBuilder().setColor(0x777777).addFields(fields)],
                });
            } catch (e) {
                await interaction.reply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("delete-cluster")
            .setDescription("クラスターを削除します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});
                const clusterId = new ObjectId(interaction.options.getString("cluster-id", true));
                const cluster = await Cluster.findActiveOne({_id: clusterId});
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }
                await cluster.remove();
                await interaction.editReply("クラスターを削除しました");
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("invite-server")
            .setDescription("クラスターにサーバーを招待します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("server-id").setDescription("サーバーのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const senderGuild = interaction.guild;
                if (senderGuild === null) {
                    throw new Error("Interaction's guild is null");
                }
                const clusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(clusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const clusterIdObject = new ObjectId(clusterId);
                const cluster = await Cluster.findActiveOne({_id: clusterIdObject});
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }

                const receiverGuildId = interaction.options.getString("server-id", true);
                if (!(await Cluster.guildAccessible(interaction.client, receiverGuildId))) {
                    await interaction.editReply("Aconitumは指定されたサーバーに参加していません");
                    return;
                }
                if (await Cluster.isIncludes({inviteList: {$elemMatch: {$eq: senderGuild.id}}, _id: clusterIdObject})) {
                    await interaction.editReply("指定されたサーバーは既に招待されています");
                    return;
                }
                if (await Cluster.isIncludes({guildIds: {$elemMatch: {$eq: receiverGuildId}}, _id: clusterIdObject})) {
                    await interaction.editReply("指定されたサーバーは既にクラスターに参加しています");
                    return;
                }

                const receiverGuild = await interaction.client.guilds.fetch(receiverGuildId);
                const announce = receiverGuild.systemChannel;
                if (announce !== null) {
                    const fields: Array<APIEmbedField> = [
                        {name: "クラスター名", value: cluster.name},
                        {name: "サーバー名", value: senderGuild.name},
                    ];
                    const embet = new EmbedBuilder().setColor(0x777777).setFields(fields);
                    await announce.send({content: "クラスターへの招待が届いています！", embeds: [embet]});
                }

                await cluster.addInviteList(receiverGuildId).update();
                await interaction.editReply("招待を送信しました");
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("delete-invite")
            .setDescription("クラスターの招待を削除します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true))
            .addStringOption(option => option.setName("server-id").setDescription("サーバーのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});
                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const clusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(clusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const cluster = await Cluster.findActiveOne({
                    _id: new ObjectId(clusterId),
                    guildIds: {$elemMatch: {$eq: guildId}},
                });
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }
                const receiverGuildId = interaction.options.getString("server-id", true);
                if (!cluster.inviteList.includes(receiverGuildId)) {
                    await interaction.editReply("指定されたサーバーに招待はありません");
                    return;
                }

                await cluster.removeInviteList(receiverGuildId).update();
                await interaction.editReply("招待を削除しました");
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("inviting-list")
            .setDescription("クラスターの招待リストを表示します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});
                const {client, guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const clusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(clusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const cluster = await Cluster.findActiveOne({
                    _id: new ObjectId(clusterId),
                    guildIds: {$elemMatch: {$eq: guildId}},
                });
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }
                const inviteIdList = cluster.inviteList;
                const inviteList = new Array<{
                    name: string;
                    value: string;
                }>();
                for (const inviteId of inviteIdList) {
                    if (await Cluster.guildAccessible(client, inviteId)) {
                        const guild = await client.guilds.fetch(inviteId);
                        inviteList.push({name: guild.name, value: inviteId});
                    } else {
                        cluster.removeInviteList(inviteId);
                    }
                }
                if (inviteList.length === 0) {
                    await interaction.editReply("招待リストは空です");
                    return;
                }
                await interaction.editReply({
                    content: "招待リスト",
                    embeds: [new EmbedBuilder().setColor(0x777777).addFields(inviteList)],
                });
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("invited-list")
            .setDescription("このサーバーを招待しているクラスターのリストを表示します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});
                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const invitedClusterList = await Cluster.findActive({inviteList: {$elemMatch: {$eq: guildId}}});
                const invitedList = new Array<{
                    name: string;
                    value: string;
                }>();
                for (const cluster of invitedClusterList) {
                    invitedList.push({name: cluster.name, value: cluster.getStringId()});
                }
                if (invitedList.length === 0) {
                    await interaction.editReply("招待されているクラスターはありません");
                    return;
                }
                await interaction.editReply({
                    content: "招待されているクラスター",
                    embeds: [new EmbedBuilder().setColor(0x777777).addFields(invitedList)],
                });
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
    {
        data: new SlashCommandBuilder()
            .setName("join-cluster")
            .setDescription("クラスターに参加します")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName("cluster-id").setDescription("クラスターのID").setRequired(true)),
        async execute(interaction: ChatInputCommandInteraction) {
            try {
                await interaction.deferReply({ephemeral: true});

                const {guildId} = interaction;
                if (guildId === null) {
                    throw new Error("Interaction's guildId is null");
                }
                const stringClusterId = interaction.options.getString("cluster-id", true);
                if (!(await checkStringId(stringClusterId))) {
                    await interaction.editReply("クラスターIDが不適切です");
                    return;
                }
                const clusterId = new ObjectId(stringClusterId);
                const cluster = await Cluster.findActiveOne({_id: clusterId});
                if (cluster === null) {
                    await interaction.editReply("クラスターが見つかりませんでした");
                    return;
                }
                if (!cluster.inviteList.includes(guildId)) {
                    await interaction.editReply("招待されていないサーバーは参加できません");
                    return;
                }
                await cluster.addGuildId(guildId).removeInviteList(guildId).update();
                await interaction.editReply("クラスターに参加しました");
            } catch (e) {
                await interaction.editReply("実行中にエラーが発生しました");
                console.error(`[ERR]: ${e}`);
            }
        },
        global: true,
    },
];

export default commands;
