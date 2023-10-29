import { type EtyMember } from '../../domain/guilds'
import { EtyMemberDb, EtyMemberDbConverter, type EtyMemberSearchParams } from './contracts'
import { dataSource } from '../source'

export class EtyMemberRepository {
  static readonly repository = dataSource.getRepository(EtyMemberDb)

  static async initMembers(members: EtyMember[]): Promise<void> {
    const values = members.map(item => ({ discordId: item.discordId.value, guildId: item.guildId.value }))

    await this.repository.createQueryBuilder()
      .insert()
      .into(EtyMemberDb)
      .values(values)
      .orIgnore(true)
      .execute()
  }

  static async initMember(member: EtyMember): Promise<void> {
    const insertResult = await this.repository.createQueryBuilder()
      .insert()
      .into(EtyMemberDb)
      .values({ guildId: member.guildId.value, discordId: member.discordId.value })
      .orIgnore(true)
      .returning('id')
      .execute()

    const values = insertResult.raw as { id: string }[]

    if (values.length > 0) {
      member.init(values[0].id)
    }
  }

  static async getMember(searchParams: EtyMemberSearchParams): Promise<EtyMember | null> {
    const db = await this.repository.findOneBy({ discordId: searchParams.discordId, id: searchParams.id })

    const domain = db ? EtyMemberDbConverter.toDomain(db) : null

    return domain
  }

  static async getMemberRequired(searchParams: EtyMemberSearchParams): Promise<EtyMember> {
    const db = await this.repository.findBy({ guildId: searchParams.guildId, discordId: searchParams.discordId, id: searchParams.id })

    if (db.length === 0) {
      throw new Error('guilds is empty')
    }

    if (db.length > 1) {
      throw new Error('guild is more one')
    }

    const guildDb = db[0]

    const domain = EtyMemberDbConverter.toDomain(guildDb)

    return domain
  }
}
