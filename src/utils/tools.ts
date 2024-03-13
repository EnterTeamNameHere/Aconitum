import type {MessageCreateOptions, MessageEditOptions, TextBasedChannel} from "discord.js";

const autoDeleteMessage = async function f(
    channel: TextBasedChannel,
    message: string,
    sec: number,
    options?: Partial<MessageCreateOptions> & Partial<MessageEditOptions>,
) {
    const firstContent = `${message}\nこのメッセージは${sec}秒後に削除されます。`;
    const sentMessage = await channel.send({...options, content: firstContent});
    for (let limit = sec; limit > 0; limit--) {
        const content = `${message}\nこのメッセージは${limit}秒後に削除されます。`;
        await sentMessage.edit({...options, content});
    }
};

export {autoDeleteMessage};
