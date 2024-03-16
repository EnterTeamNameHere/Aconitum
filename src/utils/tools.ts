import {readdirSync} from "fs";
import {statSync} from "node:fs";
import {join} from "path";

import type {MessageCreateOptions, MessageEditOptions, TextBasedChannel} from "discord.js";

function getSourceFiles(dir: string): Array<string> {
    let sourceFiles: Array<string> = new Array<string>();
    const files = readdirSync(dir).map(file => join(dir, file));
    for (const file of files) {
        if (file.endsWith(".js") || file.endsWith(".ts")) {
            sourceFiles.push(file);
        }
        const fileStat = statSync(file);
        if (fileStat.isDirectory()) {
            sourceFiles = sourceFiles.concat(getSourceFiles(file));
        }
    }
    return sourceFiles;
}

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
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }
    if (sentMessage.deletable) {
        await sentMessage.delete();
    }
};

export {getSourceFiles, autoDeleteMessage};
