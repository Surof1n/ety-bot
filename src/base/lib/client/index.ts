import defu from 'defu'
import { Client, REST, Routes, type ClientEvents, type ClientOptions } from 'discord.js'
import { type BaseCommand } from '../commands'
import { type BaseEvent, type BaseEventContext } from '../events'
import { getCommands } from './get-commands'
import { getEvents } from './get-events'
import { EtyClientJobContainer } from './job-container'

interface EttyClientOptions {
  token: string
  clientId: string
  src?: string
  commands: {
    dir: string
  }
  events: {
    dir: string
  }
}

interface ResolvedEttyClientOptions {
  token: string
  clientId: string
  src: string
  commands: {
    dir: string
  }
  events: {
    dir: string
  }
}

export interface IEtyClient {
  readonly discordClient: Client

  getCommand: (commandName: string) => BaseCommand
}

export class EtyClient implements IEtyClient {
  readonly discordClient: Client<boolean>

  private readonly ettyOptions: ResolvedEttyClientOptions
  private readonly restClient: InstanceType<typeof REST>

  private readonly commands = new Map<string, BaseCommand>()
  private readonly events = new Map<keyof ClientEvents, BaseEvent>()
  public readonly jobs = new EtyClientJobContainer()

  constructor(discordClientOptions: ClientOptions, ettyOptions: EttyClientOptions) {
    this.discordClient = new Client(discordClientOptions)
    this.restClient = new REST({ version: '10' }).setToken(ettyOptions.token)
    this.ettyOptions = defu(ettyOptions, { src: 'src' })
  }

  public getCommand(commandName: string): BaseCommand {
    const command = this.commands.get(commandName)

    if (!command) {
      throw new Error(`Not found command: ${commandName}`)
    }

    return command
  }

  private async applyCommands(commandDirPath: string, src: string): Promise<void> {
    const commandHandlers = await getCommands(commandDirPath, src)

    commandHandlers.forEach(command => {
      this.commands.set(command.builder.name, command)
    })

    const slashCommandsToRegistration = Array.from(this.commands.values()).map(item => item.builder.toJSON())

    await this.restClient.put(Routes.applicationCommands(this.ettyOptions.clientId), { body: slashCommandsToRegistration })
  }

  private async applyEvents(eventDirPath: string, src: string): Promise<void> {
    const eventsHandlers = await getEvents(eventDirPath, src)

    eventsHandlers.forEach(eventHandler => {
      const registrationMethod = eventHandler.once ? 'once' : 'on'

      const commandContext: BaseEventContext = { client: this }

      eventHandler.handle = eventHandler.handle.bind(commandContext)

      this.events.set(eventHandler.name, eventHandler)

      this.discordClient[registrationMethod](eventHandler.name, eventHandler.handle)
    })
  }

  async run(token: string): Promise<void> {
    await this.applyCommands(this.ettyOptions.commands.dir, this.ettyOptions.src)

    await this.applyEvents(this.ettyOptions.events.dir, this.ettyOptions.src)

    await this.discordClient.login(token)
  }
}
