import { Events } from 'discord.js'
import { defineEvent } from '../../../../base'
import { authNotificationCancelHandler } from '../../buttons/auth-notification-cancel/handler'
import { authNotificationConfirmHandler } from '../../buttons/auth-notification-confirm/handler'

export default defineEvent({
  name: Events.InteractionCreate,
  async handle(interaction) {
    // TODO: button handlers by id
    if (interaction.isButton()) {
      switch (interaction.customId) {
      case 'auth-notification-confirm':
        await authNotificationConfirmHandler(interaction)
        break
      case 'auth-notification-cancel':
        await authNotificationCancelHandler(interaction)
        break
      default:
        return
      }
    }

    if (!interaction.isChatInputCommand()) return

    const command = this.client.getCommand(interaction.commandName)

    try {
      await command.handle({ client: this.client }, interaction)
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`, error)
    }
  }
})
