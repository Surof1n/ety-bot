import { type DateTime } from 'luxon'
import { type EtyMemberId } from '../member/value-objects'
import { type ChannelId, type MemberAuthProcessState } from './value-objects'
import { type GuildId } from '../../value-objects'

export class MemberAuthProcess {
  memberId: EtyMemberId
  guildId: GuildId
  state: MemberAuthProcessState
  channelId: ChannelId
  helperId: EtyMemberId | null
  createdTime: DateTime | null

  constructor(userChannelId: ChannelId, memberId: EtyMemberId, guildId: GuildId, state: MemberAuthProcessState, helperId: EtyMemberId | null, createdTime: DateTime | null) {
    this.memberId = memberId
    this.state = state
    this.guildId = guildId
    this.channelId = userChannelId
    this.helperId = helperId
    this.createdTime = createdTime
  }

  public changeState(state: MemberAuthProcessState): void {
    this.state = state
  }

  public changeHelperId(helperId: EtyMemberId): void {
    this.helperId = helperId
  }
}
