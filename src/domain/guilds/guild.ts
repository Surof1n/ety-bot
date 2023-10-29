import { type EtyGuildOptions, type EtyGuildDiscordId, GuildId } from './value-objects'

export class EtyGuild {
  private readonly _id: GuildId | null
  public readonly discordId: EtyGuildDiscordId
  public options: EtyGuildOptions

  constructor(id: string | null, guildId: EtyGuildDiscordId, options: EtyGuildOptions) {
    this._id = typeof id === 'string' ? new GuildId(id) : id
    this.discordId = guildId
    this.options = options
  }

  get IsInitialized(): boolean {
    return !!this._id
  }

  getId(): GuildId {
    if (!this._id) {
      throw new Error('not init internal id')
    }

    return this._id
  }

  getStringOrUndefined(): string | undefined {
    return this._id ? this._id.value : undefined
  }
}
