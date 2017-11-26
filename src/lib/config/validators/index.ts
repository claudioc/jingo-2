import * as fs from 'fs-extra'

function checkDocumentRoot (documentRoot: string) {
  if (!documentRoot) {
    throw new Error('The document root is empty')
  }

  try {
    fs.accessSync(documentRoot, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    throw new Error(`EACCES The document root is not accessible by Jingo (${documentRoot})`)
  }

  const stat = fs.statSync(documentRoot)
  if (!stat.isDirectory()) {
    throw new Error(`EACCES The document root must be a directory (${documentRoot})`)
  }

  // @TODO it must be an absolute path (`path.isAbsolute`)
}

export default {
  checkDocumentRoot
}
