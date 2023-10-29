import fg from 'fast-glob'
import path from 'node:path'
import { type BaseEvent } from '../events'

export async function getEvents(eventDirPath: string, src?: string): Promise<BaseEvent[]> {
  const resolvedPath = src ? path.resolve(src, eventDirPath) : eventDirPath
  const files = await fg.async(resolvedPath, { onlyFiles: true })

  const imported = files.map(async (path) => {
    const module = await import(path)

    if (!module.default) {
      throw new Error(`Event not found in path: ${path}`)
    }

    return module.default as BaseEvent
  })

  const result = await Promise.all(imported)

  return result
}
