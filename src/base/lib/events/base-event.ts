import { type ClientEvents } from 'discord.js'
import { type IEtyClient } from '../client'

interface BaseEventOptions<T extends keyof ClientEvents = keyof ClientEvents > {
  name: T
  once?: boolean
  handle: (this: BaseEventContext, ...args: ClientEvents[T]) => Promise<void>
}

export interface BaseEventContext {
  client: IEtyClient
}

export interface BaseEvent<T extends keyof ClientEvents = keyof ClientEvents> {
  name: T
  once: boolean
  handle: (this: BaseEventContext, ...args: ClientEvents[T]) => Promise<void>
}

export function defineEvent<T extends keyof ClientEvents>(options: BaseEventOptions<T>): BaseEvent<T> {
  return {
    once: false,
    ...options
  }
}
