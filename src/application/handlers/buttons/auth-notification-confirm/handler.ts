import { ChannelType, type ButtonInteraction } from 'discord.js'
import { QuestService } from '../../../services/quest-service'
import { EtyGuildRepository, EtyMemberRepository } from '../../../../infrasturcture'
import { EtyMemberSearchParams } from '../../../../infrasturcture/members/contracts'
import { EtyGuildSearchParams } from '../../../../infrasturcture/guilds/contracts'

export async function authNotificationConfirmHandler(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild || !interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
    return
  }

  const guildSearchParams = EtyGuildSearchParams.byDiscordId(interaction.guild.id)
  const domainGuild = await EtyGuildRepository.getGuildRequired(guildSearchParams)

  const interactionMember = await interaction.guild.members.fetch(interaction.user)

  const memberSearchParams = EtyMemberSearchParams.byDiscordId(interactionMember.id, domainGuild.getId().value)

  const interactionMemberDomain = await EtyMemberRepository.getMemberRequired(memberSearchParams)

  await QuestService.startQuestInBotChat(interaction.channel, interaction, interactionMember, interactionMemberDomain)

  await interaction.reply({})
}
