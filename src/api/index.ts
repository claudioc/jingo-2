import { Config } from '@lib/config'
import { docFullpathFor } from '@lib/doc'
import fs from '@lib/fs'

interface IDoc {
  content: string
}

function api (config: Config): Api {
  return new Api(config)
}

class Api {
  constructor (public config: Config) {
  }

  /**
   * Save a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  public async saveDoc (docName: string, docContent: string): Promise<void> {
    await fs.writeFile(this.config.fs, this.docFullpathFor(docName), docContent)
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   */
  public async docExists (docName: string): Promise<boolean> {
    return await fs.access(this.config.fs, this.docFullpathFor(docName), fs.constants.F_OK)
  }

  public async renameDoc (oldDocName: string, newDocName: string): Promise<boolean> {
    if (oldDocName === newDocName) {
      return true
    }

    if (await this.docExists(newDocName)) {
      return false
    }

    await fs.rename(this.config.fs, this.docFullpathFor(oldDocName), this.docFullpathFor(newDocName))

    return true
  }

  /**
   * Loads a document from the file system and returns an IDoc
   * @param docName Id of the document to load
   */
  public async loadDoc (docName: string): Promise<IDoc> {
    const content = await fs.readFile(this.config.fs, this.docFullpathFor(docName))
    return {
      content
    } as IDoc
  }
  /**
   * Returns the absolute file system path of the document
   * @param docName Id of the document
   */
  protected docFullpathFor (docName: string): any {
    const docRoot = this.config.get('documentRoot') as any
    return docFullpathFor(docRoot, docName)
  }
}

export default api
