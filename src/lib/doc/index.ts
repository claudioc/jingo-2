import { Config } from '@lib/config'
import wiki, { Wiki } from '@lib/wiki'
import * as fs_ from 'fs'
import * as path from 'path'

type DocAction = 'delete' | 'update' | 'create'

function doc (config: Config): Doc {
  return new Doc(config)
}

export class Doc {
  public wikiHelpers: Wiki

  constructor (public config: Config) {
    this.wikiHelpers = wiki(config)
  }

  /**
   * Returns the URL path for a document action
   * @param docName Id of the document
   * @param action DocAction
   */
  public docPathFor (docName: string, action: DocAction): string {
    let docPath = `/doc/${action}`
    if (docName) {
      docPath += `/${this.wikiHelpers.wikify(docName)}`
    }

    return docPath
  }

  /**
   * Returns the formatted Md filename of a document
   * @param docName Id of the document
   */
  public docFilenameFor (docName: string): string {
    return docName.endsWith('.md') ? docName : `${docName}.md`
  }

  /**
   * Returns the full file system path of a document
   * @param documentRoot The document root (usually defined in the config)
   * @param docName The id of the document
   */
  public docFullpathFor (documentRoot: string, docName: string): fs_.PathLike {
    return path.resolve(documentRoot, this.docFilenameFor(docName))
  }
}

export default doc
