import { EtyGuild } from '../guild'
import { EtyGuildOptions, EtyGuildDiscordId } from '../value-objects'

export class EtyGuildFactory {
  static createByDiscordId(discordId: string): EtyGuild {
    const result = new EtyGuild(null, new EtyGuildDiscordId(discordId), EtyGuildOptions.createEmpty())

    return result
  }
}
