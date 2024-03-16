export type Config = {
    type: string;
    token: string;
    clientId: string;
    guildId: string;
    db: string;
    line: {
        channelAccessToken: string;
        channelSecret: string;
        port: number;
    };
    slackToken: string;
};
