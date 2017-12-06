import { Config, TIpcSettings } from '@lib/config'
import fs from '@lib/fs'

const checkDocumentRoot = async (config: Config, documentRoot: string): Promise<void> => {
  if (!documentRoot) {
    throw new Error('The document root is empty')
  }

  if (!await fs.access(config.fs, documentRoot, fs.constants.R_OK | fs.constants.W_OK)) {
    throw new Error(`EACCES The document root is not accessible by Jingo (${documentRoot})`)
  }

  const stat = await fs.stat(config.fs, documentRoot)
  if (!stat.isDirectory()) {
    throw new Error(`EACCES The document root must be a directory (${documentRoot})`)
  }

  // @TODO it must be an absolute path (`path.isAbsolute`)
}

const checkIpc = (ipcSettings: TIpcSettings): void => {
  // NOP
}

export default {
  checkDocumentRoot,
  checkIpc
}
