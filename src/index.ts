import * as dotenv from 'dotenv';
dotenv.config();

import { Client, Message, Snowflake, SnowflakeUtil, TextChannel } from 'discord.js';

const client = new Client(/* { messageCacheMaxSize: -1, messageCacheLifetime: 30, messageSweepInterval: 1 } */);

client.login(process.env.DISCORD_TOKEN);

client.on('debug', console.log);

client.on('ready', async () => {
    console.log('Start!', client.user.tag);
    const r6ru = client.guilds.get('414757184044531722');
    const logs = client.channels.get('602915656857419786') as TextChannel;
    let before = process.env.BEFORE;
    const after = process.env.AFTER;
    const time = (snowflake: Snowflake) => SnowflakeUtil.deconstruct(snowflake).timestamp;
    let i = 0;
    let j = 0;
    do {
        const messages = await logs.messages.fetch({ limit: 100, before });
        j += messages.size;
        const filtered = messages.filter(m => {
            const embed = m.embeds?.[0];
            return time(m.id) > time(after) && embed?.fields?.[0]?.value?.includes('R6API refreshed to');
        });
        filtered.map(m => m.delete().then(() => console.log(`${i++}/${j}`, m.id, time(m.id), m.url)));
        before = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first().id;
    } while (time(before) > time(after));

    console.log('Done!');
    process.exit(0);
});
