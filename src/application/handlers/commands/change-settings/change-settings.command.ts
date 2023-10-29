import { ActionRowBuilder, ComponentType, PermissionFlagsBits, SlashCommandBuilder, type APIApplicationCommandOptionChoice, RoleSelectMenuBuilder, ChannelSelectMenuBuilder } from 'discord.js'
import { defineCommand } from '../../../../base'
import { type EtyGuildOptionsChannels, type EtyGuildOptionsRoles } from '../../../../domain/guilds/value-objects'
import { EtyGuildRepository } from '../../../../infrasturcture'
import { EtyGuildSearchParams } from '../../../../infrasturcture/guilds/contracts'

enum ChoicesToChange {
  AuthorizedRole = 'authorizedRole',
  UnAuthorizedRole = 'unAuthorizedRole',
  AuthorizingHelperRole = 'authorizingHelperRole',
  AuthorizationChannel = 'authorizationChannel',
  CommunicationChannel = 'communicationChannel',
  AuthorizationLogChannel = 'authorizationLogChannel'
}

const choices: APIApplicationCommandOptionChoice<keyof EtyGuildOptionsRoles | keyof EtyGuildOptionsChannels>[] = [
  { name: 'Роль авторизованного пользователя', value: ChoicesToChange.AuthorizedRole },
  { name: 'Роль не авторизованного пользователя', value: ChoicesToChange.UnAuthorizedRole },
  { name: 'Текстовой канал авторизации', value: ChoicesToChange.AuthorizationChannel },
  { name: 'Основной текстовый канал для общения', value: ChoicesToChange.CommunicationChannel },
  { name: 'Текстовый канал для логирования авторизации', value: ChoicesToChange.AuthorizationLogChannel },
  { name: 'Роль для помощника авторизации', value: ChoicesToChange.AuthorizingHelperRole }
]

const command = new SlashCommandBuilder()
  .setName('настроить_сервер')
  .setDescription('настроить сервер')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(option =>
    option.setName('change_type')
      .setDescription('Что будем менять?')
      .setRequired(true)
      .setNameLocalizations({ ru: 'тип_изменения' })
      .addChoices(
        ...choices
      ))

export default defineCommand({
  builder: command,
  async handle(context, interaction) {
    const changeType = interaction.options.getString('change_type')

    if (changeType === ChoicesToChange.AuthorizedRole || changeType === ChoicesToChange.UnAuthorizedRole || changeType === ChoicesToChange.AuthorizingHelperRole) {
      const select = new RoleSelectMenuBuilder()
        .setCustomId('selecting_role')
        .setPlaceholder('Выбирите роль!')

      const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(select)

      const interactionResponse = await interaction.reply({
        components: [row],
        ephemeral: true
      })

      const roleCollector = interactionResponse.createMessageComponentCollector({ componentType: ComponentType.RoleSelect, time: 60_000 })

      roleCollector.on('collect', async event => {
        if (!event.guild) {
          return
        }

        const searchGuildParams = EtyGuildSearchParams.byDiscordId(event.guild.id)

        const guild = await EtyGuildRepository.getGuildRequired(searchGuildParams)

        guild.options.roles[changeType] = event.values[0]

        await EtyGuildRepository.updateGuild(guild)

        await event.reply({ content: 'Роль успешно обновлена!', ephemeral: true })
      })
    }

    if (changeType === ChoicesToChange.AuthorizationChannel || changeType === ChoicesToChange.CommunicationChannel || changeType === ChoicesToChange.AuthorizationLogChannel) {
      const select = new ChannelSelectMenuBuilder()
        .setCustomId('selecting_role')
        .setPlaceholder('Выбирите канал!')

      const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(select)

      const interactionResponse = await interaction.reply({
        components: [row],
        ephemeral: true
      })

      const channelCollector = interactionResponse.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect, time: 60_000 })

      channelCollector.on('collect', async event => {
        if (!event.guild) {
          return
        }

        const searchGuildParams = EtyGuildSearchParams.byDiscordId(event.guild.id)

        const guild = await EtyGuildRepository.getGuildRequired(searchGuildParams)

        guild.options.channels[changeType] = event.values[0]

        await EtyGuildRepository.updateGuild(guild)

        await event.reply({ content: 'Канал успешно обновлен!', ephemeral: true })
      })
    }
  }
})
