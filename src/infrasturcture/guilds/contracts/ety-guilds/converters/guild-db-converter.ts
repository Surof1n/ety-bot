import { EtyGuild } from '../../../../../domain/guilds'
import { EtyGuildDiscordId } from '../../../../../domain/guilds/value-objects'
import { EtyGuildDb } from '../ety-guild'

export class EtyGuildDbConverter {
  static toDomain(guildDb: EtyGuildDb): EtyGuild {
    const id = guildDb.id ?? null
    const result = new EtyGuild(id, new EtyGuildDiscordId(guildDb.discordId), guildDb.options)

    return result
  }

  static fromDomain(guild: EtyGuild): EtyGuildDb {
    const id = guild.getStringOrUndefined()

    const result = new EtyGuildDb(id, guild.discordId.value, guild.options)

    return result
  }
}
