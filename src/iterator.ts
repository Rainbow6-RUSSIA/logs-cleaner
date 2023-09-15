import { TextBasedChannel, Collection, Message } from "discord.js";

const LIMIT = 100;

export async function* iterateChannelMessages(channel: TextBasedChannel) {
  let after = "0";
  let bulk: Collection<string, Message<boolean>>;
  while (after && (!bulk || bulk.size === LIMIT)) {
    bulk = await channel.messages.fetch({ after, limit: LIMIT });
    for (const message of bulk.reverse().values()) yield message;
    after = bulk.lastKey();
  }
}
