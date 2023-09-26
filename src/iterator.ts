import {
  type TextBasedChannel,
  type Collection,
  type Message,
} from "discord.js";
import { DiscordSnowflake } from "@sapphire/snowflake";

const LIMIT = 100;

/**
 * Итерация сообщений канала. `since`
 * @export
 * @param {TextBasedChannel} channel
 * @param {number} [since=0] итерация с заданного сообщения. >=0 - с начала канала, <0 - с конца
 */
export async function* iterateChannelMessages(
  channel: TextBasedChannel,
  since: number = 0
) {
  if (!Number.isInteger(since))
    throw new RangeError(`${since} is not an integer`);
  const isForward = since >= 0;
  let skip = isForward ? since : -since - 1;

  let cursor: string | undefined = DiscordSnowflake.generate({
    timestamp: Date.UTC(isForward ? 2015 : 3015),
  }).toString();
  let bulk: Collection<string, Message<boolean>> | undefined;

  while (cursor && (!bulk || bulk.size === LIMIT)) {
    bulk = await channel.messages.fetch({
      [isForward ? "after" : "before"]: cursor,
      limit: LIMIT,
    });
    if (isForward) bulk.reverse();
    for (const message of bulk.values())
      if (skip > 0) skip--;
      else yield message;
    cursor = bulk.lastKey();
  }
}
