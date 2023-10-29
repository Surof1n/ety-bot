import { type TextChannel, type ButtonInteraction, type GuildMember, type CollectorFilter, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { type EtyMember } from '../../domain/guilds'

import { MemberAuthProcessRepository } from '../../infrasturcture/member-auth-process'
import { ChannelId, MemberAuthProcessFactory } from '../../domain/guilds/entities/member-auth-process'

export class QuestService {
  static async startQuestInBotChat(authorizationChannel: TextChannel, interaction: ButtonInteraction, discordMember: GuildMember, domainMember: EtyMember): Promise<void> {
    const confirmationReply = await interaction.reply({
      target: discordMember,
      ephemeral: true,
      content: getReplyMessageAfterSubmitWelcome(discordMember.user.id),
      components: []
    })

    try {
      await sendMessageWithQuestion(discordMember, domainMember)
    } catch (error) {
      const content = getMessageAfterFailedSendToUser(discordMember.user.id)

      const row = QuestService.getRowSubmitOrCancelButtons('Давай.')

      const collectorFilter: CollectorFilter<[ButtonInteraction]> = i => i.user.id === discordMember.user.id

      const messageAfterFailedSendToUser = await confirmationReply.edit({ content, components: [row] })

      try {
        const retryConfirmation = await messageAfterFailedSendToUser.awaitMessageComponent({ componentType: ComponentType.Button, filter: collectorFilter, time: 300_000 })

        if (retryConfirmation.customId === 'confirm') {
          await QuestService.startQuestInBotChat(authorizationChannel, retryConfirmation, discordMember, domainMember)
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

  static getRowSubmitOrCancelButtons(confirmMessage = 'А, ой, хочу!', cancelMessage = 'Нет, спасибо.'): ActionRowBuilder<ButtonBuilder> {
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel(confirmMessage)
      .setStyle(ButtonStyle.Success)

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel(cancelMessage)
      .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(confirm, cancel)

    return row
  }
}

const START_QUEST_MESSAGE = `
В одно сообщение ответь на 3 вопроса:
      1) что ты любишь ?
      2) что ты НЕ любишь ?
      3) как ты измени(лся/лась) за прошедшие 2 года ?
Расскажи настолько подробно, насколько хватит твоей фантазии (ну, или, насколько позволит Дискорд), а я пока позову кожаных, которые тебе откроют.
Смотри, не сломай здесь ничего в моё отсутствие!

Твоё сообщение увидят другие участники, чтобы ваши ценности встретились.
`

async function sendMessageWithQuestion(discordMember: GuildMember, domainMember: EtyMember): Promise<void> {
  const questMessage = await discordMember.user.send(START_QUEST_MESSAGE)

  const memberAuthProcess = MemberAuthProcessFactory.create(new ChannelId(questMessage.channelId), domainMember.getId(), domainMember.guildId)
  await MemberAuthProcessRepository.createOrUpdate(memberAuthProcess)
}

export function getMessageAfterFailedSendToUser(id: string): string {
  const result = `<@${id}>, я не могу отправить тебе письмо. Не хочешь общаться, так и скажи. Сижу тут, встречаю всех! Ухх!..
  Я мог бы написать тебе снова, перешагнув через мою гордость, но это в последний раз!
  
  Мне.. написать тебе снова ?`

  return result
}

function getReplyMessageAfterSubmitWelcome(id: string): string {
  const result = `<@${id}>, любопытство — это хорошо! Высылаю тебе ЛИЧНОЕ письмо с интересным заданием.`

  return result
}
