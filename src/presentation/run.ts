import { GatewayIntentBits, Partials } from 'discord.js'
import 'dotenv/config'
import 'reflect-metadata'

import { EtyClient } from '../base'

import { dataSource } from '../infrasturcture/source'
import { createSchedulerConsumer } from './sheduler'
import { CronJob } from 'cron'

export async function run(): Promise<void> {
  await dataSource.initialize()

  const token = process.env.TOKEN
  const clientId = process.env.CLIENT_ID

  if (!token || !clientId) {
    throw new Error('not set token or clientId')
  }

  const client = new EtyClient(
    {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.DirectMessages
      ],
      partials: [Partials.Channel]
    },
    {
      token,
      clientId,
      commands: {
        dir: './application/handlers/commands/*/*.command.ts'
      },
      events: {
        dir: './application/handlers/events/*/*.event.ts'
      }
    }
  )

  await client.run(token)

  const sheduler = createSchedulerConsumer(client)

  const job = new CronJob(
    '00 06-23 * * *',
    sheduler,
    null,
    true,
    'Europe/Moscow'
  )

  client.jobs.addJob('auth-open-period-notification', job)
}
