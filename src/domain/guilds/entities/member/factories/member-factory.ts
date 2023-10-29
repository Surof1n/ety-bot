import { type GuildId } from '../../../value-objects'
import { EtyMember } from '../member'
import { EtyMemberDiscordId } from '../value-objects'

export class EtyMemberFactory {
  static createByDiscordId(discordId: string, guildId: GuildId): EtyMember {
    const result = new EtyMember(null, new EtyMemberDiscordId(discordId), guildId)

    return result
  }
}
