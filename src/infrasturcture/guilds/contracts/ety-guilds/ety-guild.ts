import { Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Column } from 'typeorm'
import { EtyGuildOptions } from '../../../../domain/guilds/value-objects'

@Entity('ety_guild')
@Index(['id', 'discordId'], { unique: true })
export class EtyGuildDb {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @PrimaryColumn('bigint', { unique: true })
  discordId: string

  @Column('json')
  options: EtyGuildOptions

  constructor(id: string | undefined, discordId: string, options: EtyGuildOptions) {
    this.id = id
    this.discordId = discordId
    this.options = options
  }
}
