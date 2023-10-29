import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { logger, type IEtyClient } from '../../../base'
import { EtyGuildRepository } from '../../../infrasturcture'
import { EtyGuildSearchParams } from '../../../infrasturcture/guilds/contracts'

export async function memberNotificationInternalHandler(client: IEtyClient): Promise<void> {
  const searchParams = new EtyGuildSearchParams()

  const domainGuilds = await EtyGuildRepository.searchGuilds(searchParams)

  for await (const guild of domainGuilds) {
    const discordGuild = await client.discordClient.guilds.fetch(guild.discordId.value)

    const authorizationChannelId = guild.options.channels.authorizationChannel

    const domainGuildId = guild.getId()

    if (!authorizationChannelId) {
      logger.error(`authorizationChannelId is empty in guild ${domainGuildId.value}`)
      continue
    }

    const authorizationChannel = await discordGuild.channels.fetch(authorizationChannelId)

    if (!authorizationChannel || !authorizationChannel.isTextBased()) {
      logger.error(`authorizationChannel by id ${authorizationChannelId} not found for guild ${domainGuildId.value}`)

      continue
    }

    const unAuthorizedRoleId = guild.options.roles.unAuthorizedRole

    if (!unAuthorizedRoleId) {
      logger.error(`unAuthorizedRoleId is empty in guild ${domainGuildId.value}`)
      continue
    }

    const unAuthorizedRole = await discordGuild.roles.fetch(unAuthorizedRoleId)

    if (!unAuthorizedRole) {
      logger.error(`unAuthorizedRole by id ${unAuthorizedRoleId} not found for guild ${domainGuildId.value}`)
      continue
    }
    const row = getRowSubmitButton()

    const lastMessages = await authorizationChannel.messages.fetch()

    for await (const message of lastMessages.values()) {
      await message.delete()
    }

    await authorizationChannel.send({
      content: `<@&${unAuthorizedRole.id}> доебутро, как грицця!
Щас придут кожаные и будут всех здесь запускать!
Если захочешь войти, нажми на галочку, чтобы снова не сидеть под дверью, и успешно (или не очень) пройти авторизацию!`,
      components: [row]
    })
  }
}

function getRowSubmitButton(): ActionRowBuilder<ButtonBuilder> {
  const confirm = new ButtonBuilder()
    .setCustomId('auth-notification-confirm')
    .setLabel('Давай!')
    .setStyle(ButtonStyle.Success)

  const cancel = new ButtonBuilder()
    .setCustomId('auth-notification-cancel')
    .setLabel('Нет, спасибо.')
    .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(confirm, cancel)

  return row
}
