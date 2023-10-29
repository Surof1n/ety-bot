import { ChannelType, EmbedBuilder, Events, type Client, type Guild, type Message, type User, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType, type GuildMember } from 'discord.js'
import { defineEvent, logger } from '../../../../base'
import { MemberAuthProcessState, type MemberAuthProcess } from '../../../../domain/guilds/entities/member-auth-process'
import { EtyGuildRepository, EtyMemberRepository } from '../../../../infrasturcture'
import { EtyGuildSearchParams } from '../../../../infrasturcture/guilds/contracts'
import { MemberAuthProcessRepository } from '../../../../infrasturcture/member-auth-process'
import { MemberAuthProcessSearchParams } from '../../../../infrasturcture/member-auth-process/contracts'
import { EtyMemberSearchParams } from '../../../../infrasturcture/members/contracts'

const MIN_LENGTH_ANSWER = 100

const MESSAGE_FOR_NOT_ALLOWED_ANSWER = `Хоть я и слышал, что краткость — сестра Атланта (и много кого еще)... 
На самом деле я думаю, что сестра она только твоя. Даже я, будучи молью, могу написать более содержательный текст. 
Время расслабиться и дать волю воображению!
Попробуешь снова ?`

const MESSAGE_FOR_ALLOWED_ANSWER = `Богатый словарный запас, я погляжу!
Зайти можешь в дверь или в окно. Только выходить из окна не надо, меня за это уволят...
Там тебя скоро встретят мои местные кожаные.`

const cacheAttemptUserIds = new Set<string>()

export default defineEvent({
  name: Events.MessageCreate,
  async handle(message) {
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
      const memberAuthProcessSearchParams = MemberAuthProcessSearchParams.byChannelId(
        message.channel.id
      )

      const memberAuthProcess = await MemberAuthProcessRepository.getRequired(
        memberAuthProcessSearchParams
      )

      if (memberAuthProcess && memberAuthProcess.state === MemberAuthProcessState.QuestNotStarted) {
        await handleMemberAuthProcessChange(message, this.client.discordClient, memberAuthProcess)
      }
    }
  }
})

async function handleMemberAuthProcessChange(message: Message, discordClient: Client, memberAuthProcess: MemberAuthProcess): Promise<void> {
  const guildSearchParams = EtyGuildSearchParams.byId(memberAuthProcess.guildId.value)

  const notAuthorizedUser = message.author

  const domainGuild = await EtyGuildRepository.getGuildRequired(guildSearchParams)

  const discordGuild = await discordClient.guilds.fetch(domainGuild.discordId.value)

  const normilizedContent = message.content.trim()

  if (normilizedContent.length < MIN_LENGTH_ANSWER) {
    if (cacheAttemptUserIds.has(notAuthorizedUser.id)) {
      const guildMember = await discordGuild.members.fetch(notAuthorizedUser)
      await guildMember.kick()

      return
    }

    cacheAttemptUserIds.add(notAuthorizedUser.id)
    await message.reply(MESSAGE_FOR_NOT_ALLOWED_ANSWER)

    return
  }

  cacheAttemptUserIds.delete(notAuthorizedUser.id)

  memberAuthProcess.changeState(MemberAuthProcessState.MessageSent)

  await MemberAuthProcessRepository.createOrUpdate(memberAuthProcess)

  await message.reply(MESSAGE_FOR_ALLOWED_ANSWER)

  await sendInfoToCommunicationChannel(notAuthorizedUser, discordGuild, normilizedContent, domainGuild.options.channels.communicationChannel)

  const authorizingHelperRoleId = domainGuild.options.roles.authorizingHelperRole
  const authorizationLogChannel = domainGuild.options.channels.authorizationLogChannel

  const selectedHelperResult = await selectHelper(notAuthorizedUser, discordGuild, authorizingHelperRoleId, authorizationLogChannel)

  if (!selectedHelperResult) {
    return
  }

  const memberSearchParams = EtyMemberSearchParams.byDiscordId(selectedHelperResult.helper.id, domainGuild.getId().value)
  const selectedDomainHelper = await EtyMemberRepository.getMemberRequired(memberSearchParams)

  memberAuthProcess.changeState(MemberAuthProcessState.WaitHelper)

  memberAuthProcess.changeHelperId(selectedDomainHelper.getId())

  await MemberAuthProcessRepository.createOrUpdate(memberAuthProcess)

  await selectedHelperResult.authorizationLogMessage.edit({
    content: `
<@&${authorizingHelperRoleId}>, прямо сейчас <@${selectedHelperResult.helper.user.id}> отважно шагает к двери, чтобы авторизовать <@${notAuthorizedUser.id}>. Ну, или к окну. 
Только бы никто не додумался из него выйти. Без вкусняшек останусь...`,
    components: []
  })
}

interface SelectHelperResult {
  helper: GuildMember
  authorizationLogMessage: Message
}

async function selectHelper(notAuthorizedUser: User, guild: Guild, helperRoleId: string | undefined, authorizationLogChannelId: string | undefined): Promise<SelectHelperResult | null> {
  if (!helperRoleId || !authorizationLogChannelId) {
    return null
  }

  const helperRole = await guild.roles.fetch(helperRoleId)
  const authorizationLogChannel = await guild.channels.fetch(authorizationLogChannelId)

  if (!helperRole || !authorizationLogChannel || !authorizationLogChannel.isTextBased()) {
    return null
  }

  const rowButton = getRowSubmitButton()

  const authorizationLogMessage = await authorizationLogChannel.send({
    content: `
Хелова маи чюваки. <@&${helperRole.id}> 
Там <@${notAuthorizedUser.id}> в дверь ломится! Ну, или в окно. Кто хочет встретить ?`,
    components: [rowButton]
  })

  try {
    const confirmation = await authorizationLogMessage.awaitMessageComponent({ componentType: ComponentType.Button })

    if (confirmation.customId === 'confirm') {
      return { helper: confirmation.member, authorizationLogMessage }
    }
  } catch (error) {
    logger.error(error)
  }

  return null
}

async function sendInfoToCommunicationChannel(user: User, guild: Guild, content: string, communicationChannelId: string | undefined): Promise<void> {
  if (!communicationChannelId) {
    return
  }

  const communicationChannel = await guild.channels.fetch(communicationChannelId)

  if (!communicationChannel || !communicationChannel.isTextBased()) {
    return
  }

  const communicationEmbed = new EmbedBuilder({
    title: `В дверь ломится @${user.username}`,
    description: content,
    footer: { text: 'Может, стоило просто постучать?' }
  }).setColor('#6699FF')

  await communicationChannel.send({ embeds: [communicationEmbed.data] })
}

function getRowSubmitButton(): ActionRowBuilder<ButtonBuilder> {
  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Бегу!')
    .setStyle(ButtonStyle.Success)

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(confirm)

  return row
}
