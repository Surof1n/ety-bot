import { EtyGuildOptionsChannels } from './guild-options-channels'
import { EtyGuildOptionsRoles } from './guild-options-roles'

export class EtyGuildOptions {
  channels: EtyGuildOptionsChannels
  roles: EtyGuildOptionsRoles

  constructor(channelsOptions: EtyGuildOptionsChannels, rolesOptions: EtyGuildOptionsRoles) {
    this.channels = channelsOptions
    this.roles = rolesOptions
  }

  static createEmpty(): EtyGuildOptions {
    const channelOptions = new EtyGuildOptionsChannels()
    const rolesOptions = new EtyGuildOptionsRoles()

    const result = new EtyGuildOptions(channelOptions, rolesOptions)

    return result
  }
}
