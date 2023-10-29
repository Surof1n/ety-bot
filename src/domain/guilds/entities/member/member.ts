import { type GuildId } from '../../value-objects'
import { type EtyMemberDiscordId } from './value-objects'
import { EtyMemberId } from './value-objects/'

export class EtyMember {
  private _id: EtyMemberId | null
  public readonly discordId: EtyMemberDiscordId
  public readonly guildId: GuildId

  constructor(id: string | null, discordId: EtyMemberDiscordId, guildId: GuildId) {
    this._id = typeof id === 'string' ? new EtyMemberId(id) : id
    this.discordId = discordId
    this.guildId = guildId
  }

  get IsInitialized(): boolean {
    return !!this._id
  }

  getId(): EtyMemberId {
    if (!this._id) {
      throw new Error('not init internal id')
    }

    return this._id
  }

  init(id: string): void {
    this._id = new EtyMemberId(id)
  }

  getStringOrUndefined(): string | undefined {
    return this._id ? this._id.value : undefined
  }
}
