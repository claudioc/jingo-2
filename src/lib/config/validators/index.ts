import fsApi from '@lib/fs-api'
import * as fs from 'fs'

import {
  Config,
  TIpcSettings,
  TWikiSettings
} from '@lib/config'

const checkDocumentRoot = async (config: Config, documentRoot: string): Promise<void> => {
  const fsapi = fsApi(config.fsDriver)
  if (!documentRoot) {
    throw new Error('The document root is not defined')
  }

  if (!await fsapi.access(documentRoot, fs.constants.R_OK | fs.constants.W_OK)) {
    throw new Error(`EACCES The document root is not accessible by Jingo (${documentRoot})`)
  }

  const stat = await fsapi.stat(documentRoot)
  if (!stat.isDirectory()) {
    throw new Error(`EACCES The document root must be a directory (${documentRoot})`)
  }

  // @TODO it must be an absolute path (`path.isAbsolute`)
}

const checkIpc = (ipcSettings: TIpcSettings): void => {
  // NOP
}

const checkWiki = (wikiSettings: TWikiSettings): void => {
  // NOP
}

export default {
  checkDocumentRoot,
  checkIpc,
  checkWiki
}
