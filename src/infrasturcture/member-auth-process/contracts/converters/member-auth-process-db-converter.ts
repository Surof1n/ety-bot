import { DateTime } from 'luxon'
import { EtyMemberId } from '../../../../domain/guilds'
import {
  ChannelId,
  MemberAuthProcess
} from '../../../../domain/guilds/entities/member-auth-process'
import { GuildId } from '../../../../domain/guilds/value-objects'
import { MemberAuthProcessDb } from '../member-auth-process-db'

export class MemberAuthProcessDbConverter {
  static toDomain(db: MemberAuthProcessDb): MemberAuthProcess {
    const result = new MemberAuthProcess(
      new ChannelId(db.channelId),
      new EtyMemberId(db.memberId),
      new GuildId(db.guildId),
      db.state,
      db.helperId ? new EtyMemberId(db.helperId) : null,
      DateTime.fromJSDate(db.createdTime, { zone: 'utc' })
    )

    return result
  }

  static fromDomain(domain: MemberAuthProcess): MemberAuthProcessDb {
    const result = new MemberAuthProcessDb(
      domain.channelId.value,
      domain.memberId.value,
      domain.guildId.value,
      domain.state,
      domain.helperId?.value ?? null
    )

    return result
  }
}
