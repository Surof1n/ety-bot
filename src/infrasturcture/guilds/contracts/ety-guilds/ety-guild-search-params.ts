export class EtyGuildSearchParams {
  id?: string
  discordId?: string

  constructor(id?: string, discordId?: string) {
    this.id = id
    this.discordId = discordId
  }

  static byId(id: string): EtyGuildSearchParams {
    return new EtyGuildSearchParams(id, undefined)
  }

  static byDiscordId(discordId: string): EtyGuildSearchParams {
    return new EtyGuildSearchParams(undefined, discordId)
  }
}
