import { type EtyGuild } from '../../domain/guilds'
import { EtyGuildDb, EtyGuildDbConverter, type EtyGuildSearchParams } from './contracts'
import { dataSource } from '../source'

export class EtyGuildRepository {
  private static readonly repository = dataSource.getRepository(EtyGuildDb)

  static async createOrGetGuild(guild: EtyGuild): Promise<EtyGuild> {
    let domain: EtyGuild | null = await this.getGuildByDiscordId(guild.discordId.value)

    if (domain === null) {
      const createdGuild = EtyGuildDbConverter.fromDomain(guild)

      const db = await this.repository.save(createdGuild)

      domain = EtyGuildDbConverter.toDomain(db)
    }

    return domain
  }

  static async updateGuild(guild: EtyGuild): Promise<EtyGuild> {
    const createdGuild = EtyGuildDbConverter.fromDomain(guild)

    const db = await this.repository.save(createdGuild)

    const domain = EtyGuildDbConverter.toDomain(db)

    return domain
  }

  static async getGuildByDiscordId(discordId: string): Promise<EtyGuild | null> {
    const db = await this.repository.findOneBy({ discordId })

    const domain = db ? EtyGuildDbConverter.toDomain(db) : null

    return domain
  }

  static async getGuildRequired(searchParams: EtyGuildSearchParams): Promise<EtyGuild> {
    const db = await this.repository.findOneByOrFail({ discordId: searchParams.discordId, id: searchParams.id })

    const domain = EtyGuildDbConverter.toDomain(db)

    return domain
  }

  static async searchGuilds(searchParams: EtyGuildSearchParams): Promise<EtyGuild[]> {
    const guilds = await this.repository.findBy({ discordId: searchParams.discordId, id: searchParams.id })

    const result = guilds.map(guild => EtyGuildDbConverter.toDomain(guild))

    return result
  }
}
