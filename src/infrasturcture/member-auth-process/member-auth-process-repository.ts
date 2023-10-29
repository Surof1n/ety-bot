import {
  MemberAuthProcessDb,
  type MemberAuthProcessSearchParams
} from './contracts'
import { MemberAuthProcessDbConverter } from './contracts/converters/member-auth-process-db-converter'
import { type MemberAuthProcess } from '../../domain/guilds/entities/member-auth-process'
import { dataSource } from '../source'

export class MemberAuthProcessRepository {
  static readonly repository = dataSource.getRepository(MemberAuthProcessDb)

  static async createOrUpdate(
    memberAuthProcess: MemberAuthProcess
  ): Promise<void> {
    const db = MemberAuthProcessDbConverter.fromDomain(memberAuthProcess)

    await this.repository
      .createQueryBuilder('member-auth-process-insert')
      .insert()
      .values(db)
      .orUpdate(['state', 'helperId'], ['memberId', 'guildId'])
      .execute()
  }

  static async getRequired(
    searchParams: MemberAuthProcessSearchParams
  ): Promise<MemberAuthProcess | null> {
    const db = await this.repository.findOneBy({
      channelId: searchParams.channelId
    })

    const domain = db ? MemberAuthProcessDbConverter.toDomain(db) : null

    return domain
  }
}
