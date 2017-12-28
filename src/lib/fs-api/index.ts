import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

// About returning promises inside an async ts method
// https://github.com/Microsoft/TypeScript/issues/5254

type ReadFolderOptions = {
  match?: RegExp
  exclude?: RegExp
  includeDirs?: boolean
  includeFiles?: boolean
  splitDirs?: boolean
  sort?: boolean
}

const fsApi = (fsDriver): FileSystemApi => {
  return new FileSystemApi(fsDriver || fs)
}

export class FileSystemApi {
  constructor (public fsDriver) {
  }

  public async unlink (fullPath: fs.PathLike): Promise<void> {
    const fn = promisify(this.fsDriver.unlink)
    await fn(fullPath)
  }

  public async rmdir (fullPath: fs.PathLike): Promise<void> {
    const fn = promisify(this.fsDriver.rmdir)
    await fn(fullPath)
  }

  public async rename (oldPath: fs.PathLike, newPath: fs.PathLike): Promise<void> {
    const fn = promisify(this.fsDriver.rename)
    await fn(oldPath, newPath)
  }

  public async stat (filename: fs.PathLike): Promise<fs.Stats> {
    const fn = promisify(this.fsDriver.stat)
    return await fn(filename)
  }

  public statSync (filename: fs.PathLike): fs.Stats {
    return this.fsDriver.statSync(filename)
  }

  public async mkdir (fullFolderName: fs.PathLike): Promise<void> {
    const fn = promisify(this.fsDriver.mkdir)
    return await fn(fullFolderName)
  }

  public async writeFile (filename: fs.PathLike, content: string): Promise<void> {
    const fn = promisify(this.fsDriver.writeFile)
    await fn(filename, content, 'utf8')
  }

  public async readFile (filename: fs.PathLike): Promise<string> {
    const fn = promisify(this.fsDriver.readFile)
    const content = await fn(filename, 'utf8')
    return content.toString()
  }

  public async readdir (root: fs.PathLike): Promise<string[]> {
    const fn = promisify(this.fsDriver.readdir)
    return await fn(root)
  }

  public async access (filename: fs.PathLike, mode: number): Promise<boolean> {
    const fn = promisify(this.fsDriver.access)
    try {
      await fn(filename, mode)
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * High level folder reading method.
   * @param useFs
   * @param folderName
   * @param options ReadFolderOptions
   */
  public async readFolder (folderName: string, options: ReadFolderOptions = {}): Promise<string[]> {
    const items = await this.readdir(folderName)

    if (typeof options.includeFiles === 'undefined') {
      options.includeFiles = true
    }

    const files = []
    const dirs = []

    const selected = items.filter(item => {
      if (options.match && !options.match.test(item)) {
        return false
      }

      if (options.exclude && options.exclude.test(item)) {
        return false
      }

      const fullPath = path.join(folderName, item)
      const itemStat = this.statSync(fullPath)
      if (!options.includeDirs && itemStat.isDirectory()) {
        return false
      }

      if (!options.includeFiles && itemStat.isFile()) {
        return false
      }

      // Probably unnecessary
      itemStat.isDirectory() ? dirs.push(item) : files.push(item)

      return true
    })

    if (options.sort) {
      selected.sort()
    }

    return selected
  }
}

export default fsApi
