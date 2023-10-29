import fg from 'fast-glob'
import path from 'node:path'
import { type BaseCommand } from '../commands'

export async function getCommands(commandDirPath: string, src?: string): Promise<BaseCommand[]> {
  const resolvedPath = src ? path.resolve(src, commandDirPath) : commandDirPath
  const files = await fg.async(resolvedPath, { onlyFiles: true })

  const imported = files.map(async (path) => {
    const module = await import(path)

    if (!module.default) {
      throw new Error(`Command not found in path: ${path}`)
    }

    return module.default as BaseCommand
  })

  const result = await Promise.all(imported)

  return result
}
