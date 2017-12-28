import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import folder, { Folder } from '@lib/folder'
import fsApi, { FileSystemApi } from '@lib/fs-api'
import ipc, { IIpc } from '@lib/ipc'
import * as fs from 'fs'
import * as MarkdownIt from 'markdown-it'
import * as path from 'path'

interface IDoc {
  content: string
}

interface IDocItem {
  docName: string
  docTitle: string
  updatedAt: string
}

function sdk (config: Config): Sdk {
  return new Sdk(config)
}

class Sdk {
  public docHelpers: Doc
  public folderHelpers: Folder
  public parser: MarkdownIt.MarkdownIt
  public fsApi: FileSystemApi
  public ipc: IIpc

  constructor (public config: Config) {
    this.docHelpers = doc(config)
    this.folderHelpers = folder(config)
    this.parser = new MarkdownIt()
    this.fsApi = fsApi(config.fsDriver)
    this.ipc = ipc(config)
  }

  /**
   * Render a markdown string to HTML
   * @param content A markdown string
   */
  public renderToHtml (content: string) {
    return this.parser.render(content)
  }

  /**
   * Returns the list of documents in the repository
   * @param into A sub directory below the root
   */
  public async listDocs (into: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot')

    let files = await this.fsApi.readFolder(path.join(docRoot, into), {
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

    const folders = await this.fsApi.readFolder(path.join(docRoot, into), {
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
    this.ipc.send('CREATE DOC', docName)
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

    this.ipc.send('UPDATE', oldDocName)
    return this.saveDoc(docName, docContent, into)
  }

  /**
   * Deletes a document from the file system
   * @param docName Id of the document to delete
   */
  public async deleteDoc (docName: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into)
    this.ipc.send('DELETE', docName)
    return this.fsApi.unlink(fullDocName)
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   */
  public async docExists (docName: string, into: string = ''): Promise<boolean> {
    const fullDocName = this.makeFilename(docName, into)
    return await this.fsApi.access(fullDocName, fs.constants.F_OK)
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
    await this.fsApi.rename(fullDocName1, fullDocName2)
    return true
  }

  /**
   * Loads a document from the file system and returns an IDoc
   * @param docName Id of the document to load
   * @param from A subdirectory here the document can be found
   */
  public async loadDoc (docName: string, from: string = ''): Promise<IDoc> {
    const fullDocName = this.makeFilename(docName, from)
    const content = await this.fsApi.readFile(fullDocName)
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
    return await this.fsApi.access(fullFolderName, fs.constants.F_OK)
  }

  /**
   * Create a folder
   * @param folderName
   * @param into The directory where to create the folder
   */
  public async createFolder (folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeFoldername(folderName, into)
    this.ipc.send('CREATE FOLDER', folderName)
    await this.fsApi.mkdir(fullFolderName)
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
    await this.fsApi.rename(fullFolderName1, fullFolderName2)
    return true
  }

  /**
   * Deletes a folder from the file system
   * @param folderName Id of the folder to delete
   * @into into Locatio of the folder
   */
  public async deleteFolder (folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeFoldername(folderName, into)
    this.ipc.send('DELETE', folderName)
    return this.fsApi.rmdir(fullFolderName)
  }

  /**
   * Saves a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  protected async saveDoc (docName: string, docContent: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into)
    await this.fsApi.writeFile(fullDocName, docContent)
  }

  protected makeFoldername (folderName: string, parentFolder: string) {
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, folderName)
  }

  protected makeFilename (docName: string, parentFolder: string) {
    const docFilename = this.docHelpers.filenameFor(docName)
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, docFilename as any)
  }
}

export default sdk
