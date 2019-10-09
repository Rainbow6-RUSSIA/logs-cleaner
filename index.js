require('dotenv').config();

const Discord = require('discord.js');
const { Collection } = require('discord.js');
const client = new Discord.Client({ messageCacheMaxSize: -1, messageCacheLifetime: 30, messageSweepInterval: 1 });

client.login(process.env.DISCORD_TOKEN);

client.on('ready', async () => {
    console.log('Start!');
    const logs = client.channels.get('414757184480608277');

    const arr = ['deleted in <#573721436410085383>',
    'deleted in <#580774892618645524>',
    'deleted in <#622175459660005386>',
    'deleted in <#594965157696897231>',
    'deleted in <#595979224523997184>',
    'deleted in <#414757184480608277>'];

    await logs.messages.fetch({ limit: 100, before: process.env.BEFORE });
    let messages = new Collection(logs.messages.filter(m => arr.some(match => m.embeds[0] && m.embeds[0].description && m.embeds[0].description.includes(match))).array().map(m => [m.id, m]));
    let before = logs.messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first().id;
    logs.bulkDelete([...messages.values()], true);
    for (let i = 0; i < process.env.ITERATIONS; i++) {
        const bulk = await logs.messages.fetch({ limit: 100, before });
        const add = bulk
            .filter(m =>
                arr.some(match =>
                    m.embeds[0]
                    && m.embeds[0].description
                    && m.embeds[0].description.includes(match)
                )
            );
        before = bulk.first().id;
        await Promise.all(
          add.map(async m => {
            await m.delete();
            console.log(m.id, m.createdAt, m.embeds[0].description.replace('\n', '\\n'));
          })
        )
        console.log(i, 'from', add.size, 'before', before, 'last', add.first() && add.first().url);
    }
    console.log('Done!');
})