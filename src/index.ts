import * as dotenv from "dotenv";
dotenv.config();

import { Client, ForumChannel, TextChannel, WebhookClient } from "discord.js";
import { iterateChannelMessages } from "./iterator";

const client = new Client({
  intents: ["Guilds", "GuildMessageReactions", "GuildMessages"],
  sweepers: { messages: { lifetime: 3600, interval: 600 } },
});

function truncate(str: string, n: number, useWordBoundary: boolean) {
  if (str.length <= n) {
    return str;
  }
  const subString = str.slice(0, n - 1); // the original check
  return (
    (useWordBoundary
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + "…"
  );
}

const webhook = new WebhookClient({ url: process.env.WEBHOOK });

client.login(process.env.DISCORD_TOKEN);

client.on(
  "debug",
  (info) => void info.toLowerCase().includes("heartbeat") || console.log(info)
);

client.on("ready", async () => {
  console.log("Start!", client.user.tag);
  const channel = client.channels.cache.get(process.env.CHANNEL) as TextChannel;
  const forum = client.channels.cache.get(
    process.env.FORUM_CHANNEL
  ) as ForumChannel;
  const [suggestTag, deniedTag, workingTag, acceptedTag] = [
    "Предложение",
    "ОТКЛОНЕНО",
    "В РАБОТЕ",
    "ОДОБРЕНО",
  ].map((t) => forum.availableTags.find((ft) => ft.name === t).id);
  for await (const message of iterateChannelMessages(channel)) {
    if (!message.reference?.messageId) continue;
    const ref = channel.messages.cache.get(message.reference.messageId);
    if (!ref) continue;

    const title = ref.content
      .split("\n")
      .find((v) => v.toLowerCase().startsWith("желаемое изменение"))
      .replace(/желаемое изменение[: ]*/gi, "");
    if (!title) continue;
    const [, denied, working, accepted] =
      /(отклон)|(в работе)|(одобрено)/gi.exec(message.content);
    if (!(denied || working || accepted)) continue;

    const post = await webhook.send({
      content: ref.content,
      files: [...ref.attachments.values()],
      avatarURL: ref.author.avatarURL(),
      username: ref.author.displayName,
      threadName: truncate(
        title.charAt(0).toUpperCase() + title.slice(1),
        95,
        true
      ),
    });

    const thread = forum.threads.cache.get(post.channel_id);

    await webhook.send({
      content: message.content,
      files: [...message.attachments.values()],
      avatarURL: message.author.avatarURL(),
      username: message.author.displayName,
      threadId: thread.id,
    });

    await thread.setAppliedTags(
      [
        suggestTag,
        denied && deniedTag,
        working && workingTag,
        accepted && acceptedTag,
      ].filter(Boolean)
    );
    // break;
  }
  console.log("Done!");
});
