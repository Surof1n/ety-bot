import { logger } from './base'
import { run } from './presentation'

run().then(() => {
  console.log('start')
}).catch((e) => {
  console.log(e)
  logger.error(e)
})
