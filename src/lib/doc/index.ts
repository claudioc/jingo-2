import { wikify } from '@lib/wiki'
import * as fs_ from 'fs'
import * as path from 'path'

type DocAction = 'delete' | 'update' | 'create'

/**
 * Returns the URL path for a document action
 * @param docName Id of the document
 * @param action DocAction
 */
const docPathFor = (docName: string, action: DocAction): string => {
  let docPath = `/doc/${action}`
  if (docName) {
    docPath += `/${wikify(docName)}`
  }

  return docPath
}

/**
 * Returns the formatted Md filename of a document
 * @param docName Id of the document
 */
const docFilenameFor = (docName: string): string => {
  return docName.endsWith('.md') ? docName : `${docName}.md`
}

/**
 * Returns the full file system path of a document
 * @param documentRoot The document root (usually defined in the config)
 * @param docName The id of the document
 */
const docFullpathFor = (documentRoot: string, docName: string): fs_.PathLike => {
  return path.resolve(documentRoot, docFilenameFor(docName))
}

export {
  docFilenameFor,
  docFullpathFor,
  docPathFor
}
