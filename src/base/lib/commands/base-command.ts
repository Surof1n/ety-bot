import { type ChatInputCommandInteraction, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js'
import { type IEtyClient } from '../client'

export interface BaseCommandContext { client: IEtyClient }

interface ISlashCommandBuilderToJson {
  name: string
  toJSON: () => RESTPostAPIChatInputApplicationCommandsJSONBody
}

interface BaseCommandOptions {
  builder: ISlashCommandBuilderToJson
  handle: (context: BaseCommandContext, interaction: ChatInputCommandInteraction) => Promise<void>
}

export interface BaseCommand {
  builder: ISlashCommandBuilderToJson
  handle: (context: BaseCommandContext, interaction: ChatInputCommandInteraction) => Promise<void>
}

export async function defineCommand(options: BaseCommandOptions): Promise<BaseCommand> {
  return {
    ...options
  }
}
