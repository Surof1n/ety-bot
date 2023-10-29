import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { defineCommand } from '../../../../base'

const command = new SlashCommandBuilder()
  .setName('ембед')
  .setDescription('настроить сервер')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(option =>
    option.setName('href')
      .setDescription('Изображение')
      .setRequired(true)
      .setNameLocalizations({ ru: 'ссылка' }))
  .addStringOption(option =>
    option.setName('color')
      .setDescription('Цвет')
      .setRequired(true)
      .setNameLocalizations({ ru: 'цвет' }))

export default defineCommand({
  builder: command,
  async handle(context, interaction) {
    const color = interaction.options.getString('color', true)

    const embed = new EmbedBuilder({
      image: { url: interaction.options.getString('href', true) }
    }).setColor(color as `#${string}`)

    await interaction.channel?.send({ embeds: [embed] })
  }
})
