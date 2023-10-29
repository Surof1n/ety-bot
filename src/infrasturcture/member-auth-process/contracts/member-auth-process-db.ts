import { DateTime } from 'luxon'
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'
import { MemberAuthProcessState } from '../../../domain/guilds/entities/member-auth-process'

@Entity('member_auth_process_db')
@Index(['memberId', 'guildId'], { unique: true })
export class MemberAuthProcessDb {
  @PrimaryColumn('bigint', { unique: true })
  channelId: string

  @Column('uuid')
  memberId: string

  @Column('uuid')
  guildId: string

  @Column({
    type: 'enum',
    enum: MemberAuthProcessState
  })
  state: MemberAuthProcessState

  @Column('uuid', {
    nullable: true
  })
  helperId: string | null

  @CreateDateColumn({ type: 'timestamp with time zone', default: DateTime.now().toJSDate() })
  createdTime!: Date

  constructor(channelId: string, memberId: string, guildId: string, state: MemberAuthProcessState, helperId: string | null) {
    this.memberId = memberId
    this.state = state
    this.guildId = guildId
    this.channelId = channelId
    this.helperId = helperId
  }
}
