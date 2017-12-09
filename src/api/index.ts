import { Config } from '@lib/config'
import { docFullpathFor } from '@lib/doc'
import fs from '@lib/fs'
import ipc from '@lib/ipc'

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
   * Create a doc: proxy call to the saveDoc
   * @param docName
   * @param docContent
   */
  public async createDoc (docName: string, docContent: string): Promise<void> {
    ipc(this.config).send('CREATE', docName)
    return this.saveDoc(docName, docContent)
  }

  /**
   * Update a doc: proxy call to the saveDoc
   * @param docName
   * @param docContent
   */
  public async updateDoc (docName: string, oldDocName: string, docContent: string): Promise<void> {
    // Rename the file (if needed and if possible)
    if (!(await this.renameDoc(oldDocName, docName))) {
      throw new Error('Cannot rename a document to an already existant one')
    }

    ipc(this.config).send('UPDATE', oldDocName)
    return this.saveDoc(docName, docContent)
  }

  /**
   * Deletes a document from the file system
   * @param docName Id of the document to delete
   */
  public async deleteDoc (docName: string): Promise<void> {
    ipc(this.config).send('DELETE', docName)
    return fs.unlink(this.config.fs, this.docFullpathFor(docName))
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   */
  public async docExists (docName: string): Promise<boolean> {
    return await fs.access(this.config.fs, this.docFullpathFor(docName), fs.constants.F_OK)
  }

  /**
   * Renames a document taking care of not overwriting the destination
   * Returns true if the rename is succesful, false otherwise
   * @param oldDocName
   * @param newDocName
   */
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

  /**
   * Saves a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  protected async saveDoc (docName: string, docContent: string): Promise<void> {
    await fs.writeFile(this.config.fs, this.docFullpathFor(docName), docContent)
  }
}

export default api
