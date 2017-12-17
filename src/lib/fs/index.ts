import * as fs_ from 'fs'
import { promisify } from 'util'

// About returning promises inside an async ts method
// https://github.com/Microsoft/TypeScript/issues/5254

const unlink = async  (useFs, path: fs_.PathLike): Promise<void> => {
  const fn = promisify((useFs || fs_).unlink)
  await fn(path)
}

const rename = async (useFs, oldPath: fs_.PathLike, newPath: fs_.PathLike): Promise<void> => {
  const fn = promisify((useFs || fs_).rename)
  await fn(oldPath, newPath)
}

const stat = async (useFs, filename: fs_.PathLike): Promise<fs_.Stats> => {
  const fn = promisify((useFs || fs_).stat)
  return await fn(filename)
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
  readdir,
  rename,
  stat,
  unlink,
  writeFile
}
