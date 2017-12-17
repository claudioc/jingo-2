import * as fs_ from 'fs'
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

/**
 * High level folder reading method.
 * @param useFs
 * @param folderName
 * @param options ReadFolderOptions
 */
const readFolder = async (useFs, folderName: string, options: ReadFolderOptions = {}): Promise<string[]> => {
  const items = await readdir(useFs, folderName)

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
    const itemStat = statSync(useFs, fullPath)
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

const unlink = async  (useFs, fullPath: fs_.PathLike): Promise<void> => {
  const fn = promisify((useFs || fs_).unlink)
  await fn(fullPath)
}

const rename = async (useFs, oldPath: fs_.PathLike, newPath: fs_.PathLike): Promise<void> => {
  const fn = promisify((useFs || fs_).rename)
  await fn(oldPath, newPath)
}

const stat = async (useFs, filename: fs_.PathLike): Promise<fs_.Stats> => {
  const fn = promisify((useFs || fs_).stat)
  return await fn(filename)
}

const statSync = (useFs, filename: fs_.PathLike): fs_.Stats => {
  return (useFs || fs_).statSync(filename)
}

const mkdir = async (useFs, fullFolderName: fs_.PathLike): Promise<void> => {
  const fn = promisify((useFs || fs_).mkdir)
  return await fn(fullFolderName)
}

const writeFile = async (useFs, filename: fs_.PathLike, content: string): Promise<void> => {
  const fn = promisify((useFs || fs_).writeFile)
  await fn(filename, content, 'utf8')
}

const readFile = async (useFs, filename: fs_.PathLike): Promise<string> => {
  const fn = promisify((useFs || fs_).readFile)
  const content = await fn(filename, 'utf8')
  return content.toString()
}

const readdir = async (useFs, root: fs_.PathLike): Promise<string[]> => {
  const fn = promisify((useFs || fs_).readdir)
  return await fn(root)
}

const access = async (useFs, filename: fs_.PathLike, mode: number): Promise<boolean> => {
  const fn = promisify((useFs || fs_).access)
  try {
    await fn(filename, mode)
    return true
  } catch (err) {
    return false
  }
}

export default {
  access,
  constants: fs_.constants,
  mkdir,
  readFile,
  readFolder,
  readdir,
  rename,
  stat,
  unlink,
  writeFile
}
