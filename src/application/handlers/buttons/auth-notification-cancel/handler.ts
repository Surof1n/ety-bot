import { ChannelType, type ButtonInteraction } from 'discord.js'
import { logger } from '../../../../base'

export async function authNotificationCancelHandler(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild || !interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
    return
  }

  const interactionMember = await interaction.guild.members.fetch(interaction.user)

  try {
    await interaction.reply({})
    await interactionMember.kick()
  } catch (e) {
    logger.error(e)
  }
}
