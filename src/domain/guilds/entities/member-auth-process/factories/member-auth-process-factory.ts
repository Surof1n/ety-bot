import { type GuildId } from '../../../value-objects'
import { type EtyMemberId } from '../../member/value-objects'
import { MemberAuthProcess } from '../member-auth-process'
import { MemberAuthProcessState, type ChannelId } from '../value-objects'

export class MemberAuthProcessFactory {
  static create(channelId: ChannelId, memberId: EtyMemberId, guildId: GuildId): MemberAuthProcess {
    const result = new MemberAuthProcess(channelId, memberId, guildId, MemberAuthProcessState.QuestNotStarted, null, null)

    return result
  }
}
