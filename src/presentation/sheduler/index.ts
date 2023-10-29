import { memberNotificationInternalHandler } from '../../application/commands'
import { type EtyClient } from '../../base'

export function createSchedulerConsumer(client: EtyClient): () => Promise<void> {
  return async () => {
    await memberNotificationInternalHandler(client)
  }
}
