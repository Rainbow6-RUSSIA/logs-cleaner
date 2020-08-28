import * as dotenv from 'dotenv';
dotenv.config();

import { Client, Message, Snowflake, SnowflakeUtil, TextChannel } from 'discord.js';

const client = new Client(/* { messageCacheMaxSize: -1, messageCacheLifetime: 30, messageSweepInterval: 1 } */);

client.login(process.env.DISCORD_TOKEN);

client.on('debug', info => info.toLowerCase().includes('heartbeat') || console.log(info));

client.on('ready', async () => {
    console.log('Start!', client.user.tag);
    const logs = client.channels.get(process.env.CHANNEL) as TextChannel;
    let before = process.env.BEFORE;
    const after = process.env.AFTER;
    const time = (snowflake: Snowflake) => SnowflakeUtil.deconstruct(snowflake).timestamp;
    let i = 1;
    let j = 0;
    do {
        const messages = await logs.messages.fetch({ limit: 100, before });
        const filtered = messages.filter(m => {
            // const embed = m.embeds?.[0];
            return time(m.id) > time(after) && new RegExp(process.env.REGEXP).test(m.content); // embed?.fields?.[0]?.value?.includes(process.env.TRIGGER);
        });
        j += filtered.size;
        filtered.map(m => m.delete().then(() => console.log(`${i}/${j}/${(100 * i++ / j).toPrecision(3)}%`, m.id, new Date(time(m.id)), m.url)).catch(console.log));
        before = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first().id;
    } while (time(before) > time(after));

    console.log('Done!');
});
