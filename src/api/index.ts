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
   * @param into A sub directory below the root
   */
  public async listDocs (into: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot')

    let files = await fs.readFolder(this.config.fs, path.join(docRoot, into), {
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
   * @param into A sub directory below the root
   */
  public async listFolders (into: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot')

    const folders = await fs.readFolder(this.config.fs, path.join(docRoot, into), {
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
  public async createDoc (docName: string, docContent: string, into: string = ''): Promise<void> {
    ipc(this.config).send('CREATE DOC', docName)
    return this.saveDoc(docName, docContent, into)
  }

  /**
   * Update a doc: proxy call to the saveDoc
   * @param docName
   * @param docContent
   */
  public async updateDoc (docName: string, oldDocName: string, docContent: string, into: string = ''): Promise<void> {
    // Rename the file (if needed and if possible)
    if (!(await this.renameDoc(oldDocName, docName, into))) {
      throw new Error('Cannot rename a document to an already existant one')
    }

    ipc(this.config).send('UPDATE', oldDocName)
    return this.saveDoc(docName, docContent, into)
  }

  /**
   * Deletes a document from the file system
   * @param docName Id of the document to delete
   */
  public async deleteDoc (docName: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into)
    ipc(this.config).send('DELETE', docName)
    return fs.unlink(this.config.fs, fullDocName)
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   */
  public async docExists (docName: string, into: string = ''): Promise<boolean> {
    const fullDocName = this.makeFilename(docName, into)
    return await fs.access(this.config.fs, fullDocName, fs.constants.F_OK)
  }

  /**
   * Renames a document taking care of not overwriting the destination
   * Returns true if the rename is succesful, false otherwise
   * @param oldDocName
   * @param newDocName
   * @param into directory where the document resides
   */
  public async renameDoc (oldDocName: string, newDocName: string, into: string = ''): Promise<boolean> {
    if (oldDocName === newDocName) {
      return true
    }

    if (await this.docExists(newDocName, into)) {
      return false
    }
    const fullDocName1 = this.makeFilename(oldDocName, into)
    const fullDocName2 = this.makeFilename(newDocName, into)
    await fs.rename(this.config.fs, fullDocName1, fullDocName2)
    return true
  }

  /**
   * Loads a document from the file system and returns an IDoc
   * @param docName Id of the document to load
   */
  public async loadDoc (docName: string, from: string = ''): Promise<IDoc> {
    const fullDocName = this.makeFilename(docName, from)
    const content = await fs.readFile(this.config.fs, fullDocName)
    return {
      content
    } as IDoc
  }

  /**
   * Returns whether a folder exists or not
   * @param docName Id of the document to check
   * @param into The directory where the folder should be
   */
  public async folderExists (folderName: string, into: string = ''): Promise<boolean> {
    const fullFolderName = this.makeFoldername(folderName, into)
    return await fs.access(this.config.fs, fullFolderName, fs.constants.F_OK)
  }

  /**
   * Create a folder
   * @param folderName
   * @param into The directory where to create the folder
   */
  public async createFolder (folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeFoldername(folderName, into)
    ipc(this.config).send('CREATE FOLDER', folderName)
    await fs.mkdir(this.config.fs, fullFolderName)
  }

  /**
   * Renames a folder taking care of not overwriting the destination
   * Returns true if the rename is succesful, false otherwise
   * @param oldFolderName
   * @param newFolderName
   * @param into The directory where old and new reside
   */
  public async renameFolder (oldFolderName: string, newFolderName: string, into: string = ''): Promise<boolean> {
    if (oldFolderName === newFolderName) {
      return true
    }

    if (await this.folderExists(newFolderName, into)) {
      return false
    }
    const fullFolderName1 = this.makeFoldername(oldFolderName, into)
    const fullFolderName2 = this.makeFoldername(newFolderName, into)
    await fs.rename(this.config.fs, fullFolderName1, fullFolderName2)
    return true
  }

  /**
   * Deletes a folder from the file system
   * @param folderName Id of the folder to delete
   * @into into Locatio of the folder
   */
  public async deleteFolder (folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeFoldername(folderName, into)
    ipc(this.config).send('DELETE', folderName)
    return fs.rmdir(this.config.fs, fullFolderName)
  }

  /**
   * Saves a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  protected async saveDoc (docName: string, docContent: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into)
    await fs.writeFile(this.config.fs, fullDocName, docContent)
  }

  protected makeFoldername (folderName: string, parentFolder: string) {
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, folderName)
  }

  protected makeFilename (docName: string, parentFolder: string) {
    const docFilename = this.docHelpers.filenameFor(docName)
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, docFilename as any)
  }
}

export default api
