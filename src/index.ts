import * as dotenv from "dotenv";
dotenv.config();

import { Client, TextChannel, WebhookClient, EmbedBuilder } from "discord.js";
import { iterateChannelMessages } from "./iterator";
import { setTimeout } from "timers/promises";

const client = new Client({
  intents: ["Guilds", "GuildMessageReactions", "GuildMessages"],
});

const webhook1 = new WebhookClient({ url: process.env.WEBHOOK1 });
const webhook2 = new WebhookClient({ url: process.env.WEBHOOK2 });
let i = 0;
function webhook() {
  i++;
  return webhook2;
}

client.login(process.env.DISCORD_TOKEN);

client.on(
  "debug",
  (info) => void info.toLowerCase().includes("heartbeat") || console.log(info)
);

client.on("ready", async () => {
  console.log("Start!", client.user.tag);
  const channel = client.channels.cache.get(process.env.CHANNEL) as TextChannel;
  for await (const {
    reactions,
    author,
    attachments,
    content,
    createdAt,
  } of iterateChannelMessages(channel)) {
    await webhook().send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: author.globalName,
            iconURL: author.avatarURL(),
            url: "https://discord.com/users/" + author.id,
          })
          .setDescription(content.replaceAll("|", "") || null)
          .setTimestamp(createdAt)
          .addFields({
            name: "Реакции",
            value:
              reactions.cache
                .map((r) => `${r.emoji} \`${r.count}\``)
                .join(", ") || "н/д",
          })
          .toJSON(),
      ],
      threadId: process.env.FORUM_POST,
      allowedMentions: {},
      files: [...attachments.values()],
    });
    await setTimeout(1000);
  }
  console.log("Done!");
});
