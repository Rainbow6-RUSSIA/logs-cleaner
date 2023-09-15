import * as dotenv from "dotenv";
dotenv.config();

import { Client, TextChannel, WebhookClient } from "discord.js";
import { iterateChannelMessages } from "./iterator";

const client = new Client({
  intents: ["Guilds", "GuildMessageReactions", "GuildMessages"],
});

const webhook = new WebhookClient({ url: process.env.WEBHOOK });

client.login(process.env.DISCORD_TOKEN);

client.on(
  "debug",
  (info) => void info.toLowerCase().includes("heartbeat") || console.log(info)
);

client.on("ready", async () => {
  console.log("Start!", client.user.tag);
  const channel = client.channels.cache.get(process.env.CHANNEL) as TextChannel;
  let i = 0;
  for await (const message of iterateChannelMessages(channel)) {
    if (i > 5) break;
    const content = [
      `${message.content}`,
      `(репостнул ${message.author} в <t:${message.createdTimestamp}>)`,
      message.reactions.cache.map((r) => `${r.emoji} - ${r.count}`).join(", "),
      ...message.attachments.map((a) => a.url),
    ].join("\n");
    await webhook.send({ content, threadId: process.env.FORUM_POST });
    i++;
  }
  console.log("Done!");
});
