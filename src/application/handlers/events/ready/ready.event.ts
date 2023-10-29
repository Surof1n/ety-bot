import { Events } from 'discord.js'
import { defineEvent } from '../../../../base'
import { EtyGuildFactory, EtyMemberFactory } from '../../../../domain/guilds'

import { EtyGuildRepository, EtyMemberRepository } from '../../../../infrasturcture'

export default defineEvent({
  name: Events.ClientReady,
  async handle(client) {
    const guilds = await client.guilds.fetch()

    for await (const [, guild] of guilds) {
      const discordGuild = await guild.fetch()

      let domainGuild = EtyGuildFactory.createByDiscordId(discordGuild.id)

      domainGuild = await EtyGuildRepository.createOrGetGuild(domainGuild)

      const domainGuildId = domainGuild.getId()

      const guildMembers = await discordGuild.members.fetch()

      const domainMembers = guildMembers.map(item => EtyMemberFactory.createByDiscordId(item.id, domainGuildId))

      await EtyMemberRepository.initMembers(domainMembers)
    }
  }
})
