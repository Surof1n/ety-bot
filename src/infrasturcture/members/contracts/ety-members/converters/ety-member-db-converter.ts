import { EtyMember, EtyMemberDiscordId } from '../../../../../domain/guilds'
import { GuildId } from '../../../../../domain/guilds/value-objects'
import { EtyMemberDb } from '../ety-member-db'

export class EtyMemberDbConverter {
  static toDomain(db: EtyMemberDb): EtyMember {
    const id = db.id ?? null
    const result = new EtyMember(id, new EtyMemberDiscordId(db.discordId), new GuildId(db.guildId))

    return result
  }

  static fromDomain(domain: EtyMember): EtyMemberDb {
    const id = domain.getStringOrUndefined()

    const result = new EtyMemberDb(id, domain.discordId.value, domain.guildId.value)

    return result
  }
}
