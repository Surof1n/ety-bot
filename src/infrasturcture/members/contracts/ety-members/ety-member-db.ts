import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ety_member')
@Index(['discordId', 'guildId'], { unique: true })
export class EtyMemberDb {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column('bigint', {})
  discordId!: string

  @Column('uuid')
  guildId!: string

  constructor(id: string | undefined, discordId: string, guildId: string) {
    this.id = id
    this.discordId = discordId
    this.guildId = guildId
  }
}
