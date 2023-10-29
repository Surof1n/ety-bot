import { ChannelType, ComponentType, Events, type ButtonInteraction, type CollectorFilter } from 'discord.js'
import { defineEvent } from '../../../../base'
import { EtyMemberFactory } from '../../../../domain/guilds'

import { DateTime } from 'luxon'
import { EtyGuildRepository, EtyMemberRepository } from '../../../../infrasturcture'
import { EtyGuildSearchParams } from '../../../../infrasturcture/guilds/contracts'
import { EtyMemberSearchParams } from '../../../../infrasturcture/members/contracts'
import { QuestService, getMessageAfterFailedSendToUser } from '../../../services/quest-service'

export default defineEvent({
  name: Events.GuildMemberAdd,
  async handle(discordMember) {
    const searchParams = EtyGuildSearchParams.byDiscordId(discordMember.guild.id)

    const guild = await EtyGuildRepository.getGuildRequired(searchParams)

    const guildId = guild.getId()

    const searchMemberParams = EtyMemberSearchParams.byDiscordId(discordMember.id, discordMember.guild.id)

    let member = await EtyMemberRepository.getMember(searchMemberParams)

    if (!member) {
      member = EtyMemberFactory.createByDiscordId(discordMember.id, guildId)

      await EtyMemberRepository.initMember(member)
    }

    if (guild.options.roles.unAuthorizedRole) {
      const unAuthorizedRole = await discordMember.guild.roles.fetch(guild.options.roles.unAuthorizedRole)

      if (!unAuthorizedRole) {
        return
      }

      await discordMember.roles.add(unAuthorizedRole)
    }

    if (guild.options.channels.authorizationChannel) {
      const authorizationChannel = await discordMember.guild.channels.fetch(guild.options.channels.authorizationChannel)

      if (authorizationChannel && authorizationChannel.type === ChannelType.GuildText) {
        const row = QuestService.getRowSubmitOrCancelButtons()

        const moscowNow = DateTime.now().setZone('Europe/Moscow')

        const isAuthorizationPeriod = moscowNow.hour >= 6 && (moscowNow.hour < 23 || (moscowNow.hour === 23 && moscowNow.minute <= 50))

        if (isAuthorizationPeriod) {
          const authorizationChannelMessage = await authorizationChannel.send({ target: discordMember, content: getWelcomeMessage(discordMember.user.id), components: [row] })

          const collectorFilter: CollectorFilter<[ButtonInteraction]> = i => i.user.id === discordMember.user.id

          try {
            const confirmation = await authorizationChannelMessage.awaitMessageComponent({ componentType: ComponentType.Button, filter: collectorFilter, time: 300_000 })

            if (confirmation.customId === 'confirm') {
              await QuestService.startQuestInBotChat(authorizationChannel, confirmation, discordMember, member)
            } else if (confirmation.customId === 'cancel') {
              await authorizationChannelMessage.delete()
              await discordMember.kick()
            }
          } catch (e) {
            await authorizationChannelMessage.delete()
            await discordMember.kick()
          }
        } else {
          await authorizationChannel.send(`<@${discordMember.user.id}>, идём скажу тебе кое-что в ЛС.`)

          try {
            await discordMember.user.send(nightPrivateChatMessage)
          } catch (error) {
            const collectorFilter: CollectorFilter<[ButtonInteraction]> = i => i.user.id === discordMember.user.id

            const messageAfterFailedSendToUser = await authorizationChannel.send({ content: getMessageAfterFailedSendToUser(discordMember.user.id), components: [row] })

            try {
              const retryConfirmation = await messageAfterFailedSendToUser.awaitMessageComponent({ componentType: ComponentType.Button, filter: collectorFilter, time: 300_000 })

              if (retryConfirmation.customId === 'confirm') {
                try {
                  await discordMember.user.send(nightPrivateChatMessage)
                } catch (error) {
                  await discordMember.kick()
                }
              } else if (retryConfirmation.customId === 'cancel') {
                await messageAfterFailedSendToUser.delete()
                await discordMember.kick()
              }
            } catch (e) {
              await messageAfterFailedSendToUser.delete()
              await discordMember.kick()
            }
          }
        }
      }
    }
  }
})
function getWelcomeMessage(id: string): string {
  const result = `<@${id}>, так и будешь двери разглядывать ? Не, ну они у нас, канешна, красивые, и дело это не моё... А всё-таки, хочешь войти ?`

  return result
}

const nightPrivateChatMessage = `
По ночам гулять любишь ? 
Эти, наши, дрыхают. Меня просили передать тебе что-то  вежливое про "чтобы тебя всегда встречали бодрые и довольные жизнью люди", но дальше я не запомнил. Если захочешь остаться, то позже тебя пригласят войти.
Время, когда кожаные всех сюда запускают, с 06:00 по 23:50мск.
`
