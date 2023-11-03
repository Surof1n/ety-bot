import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { defineCommand } from '../../../../base'

const command = new SlashCommandBuilder()
  .setName('ембед')
  .setDescription('настроить сервер')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(option =>
    option.setName('params')
      .setDescription('Изображение')
      .setRequired(true)
      .setNameLocalizations({ ru: 'ссылка_и_цвет_через_пробел' }))

export default defineCommand({
  builder: command,
  async handle(context, interaction) {
    const params = interaction.options.getString('params', true).split(' ')

    const embed = new EmbedBuilder({
      image: { url: params[0] }
    }).setColor(params[1] as `#${string}`)

    await interaction.channel?.send({ embeds: [embed] })
  }
})
