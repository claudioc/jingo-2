import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import folder, { Folder } from '@lib/folder'
import fs from '@lib/fs'
import ipc from '@lib/ipc'
import * as path from 'path'

interface IDoc {
  content: string
}

interface IDocItem {
  docName: string
  docTitle: string
  updatedAt: string
}

function api (config: Config): Api {
  return new Api(config)
}

class Api {
  public docHelpers: Doc
  public folderHelpers: Folder

  constructor (public config: Config) {
    this.docHelpers = doc(config)
    this.folderHelpers = folder(config)
  }

  /**
   * Returns the list of documents in the repository
   * @param subdir A sub directory below the root
   */
  public async listDocs (subdir: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot')

    let files = await fs.readFolder(this.config.fs, path.join(docRoot, subdir), {
      exclude: /^\./,
      includeDirs: false,
      includeFiles: true,
      match: /\.md$/
    })

    files = files.map(file => file.slice(0, -3))
    return files
  }

  /**
   * Returns the list of folders in the path
   * @param subdir A sub directory below the root
   */
  public async listFolders (subdir: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot')

    const folders = await fs.readFolder(this.config.fs, path.join(docRoot, subdir), {
      exclude: /^\./,
      includeDirs: true,
      includeFiles: false
    })

    return folders
  }

  /**
   * Create a doc: proxy call to the saveDoc
   * @param docName
   * @param docContent
   */
  public async createDoc (docName: string, docContent: string): Promise<void> {
    ipc(this.config).send('CREATE DOC', docName)
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
    return fs.unlink(this.config.fs, this.docHelpers.docFullpathFor(docName))
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   */
  public async docExists (docName: string): Promise<boolean> {
    return await fs.access(this.config.fs, this.docHelpers.docFullpathFor(docName), fs.constants.F_OK)
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

    await fs.rename(this.config.fs, this.docHelpers.docFullpathFor(oldDocName), this.docHelpers.docFullpathFor(newDocName))
    return true
  }

  /**
   * Loads a document from the file system and returns an IDoc
   * @param docName Id of the document to load
   */
  public async loadDoc (docName: string): Promise<IDoc> {
    const content = await fs.readFile(this.config.fs, this.docHelpers.docFullpathFor(docName))
    return {
      content
    } as IDoc
  }

  /**
   * Returns whether a folder exists or not
   * @param docName Id of the document to check
   */
  public async folderExists (folderName: string): Promise<boolean> {
    const fullFolderName = this.folderHelpers.fullpathFor(folderName)
    return await fs.access(this.config.fs, fullFolderName, fs.constants.F_OK)
  }

  /**
   * Create a folder
   * @param folderName
   */
  public async createFolder (folderName: string): Promise<void> {
    const fullFolderName = this.folderHelpers.fullpathFor(folderName)
    ipc(this.config).send('CREATE FOLDER', folderName)
    await fs.mkdir(this.config.fs, fullFolderName)
  }

  /**
   * Saves a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  protected async saveDoc (docName: string, docContent: string): Promise<void> {
    await fs.writeFile(this.config.fs, this.docHelpers.docFullpathFor(docName), docContent)
  }
}

export default api
