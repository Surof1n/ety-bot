export class EtyMemberSearchParams {
  id?: string
  discordId?: string
  guildId?: string

  constructor(id?: string, discordId?: string, guildId?: string) {
    this.id = id
    this.discordId = discordId
    this.guildId = guildId
  }

  static byId(id: string): EtyMemberSearchParams {
    return new EtyMemberSearchParams(id, undefined)
  }

  static byDiscordId(discordId: string, guildId: string): EtyMemberSearchParams {
    return new EtyMemberSearchParams(undefined, discordId, guildId)
  }
}
