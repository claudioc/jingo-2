import { Config } from '@lib/config';
import doc, { Doc } from '@lib/doc';
import folder, { Folder } from '@lib/folder';
import fsApi, { FileSystemApi } from '@lib/fs-api';
import git from '@lib/git';
import wiki, { Wiki } from '@lib/wiki';
import * as fs from 'fs';
import * as hljs from 'highlight.js';
import * as path from 'path';

/* Markdown-it and its plugins */
import * as MarkdownIt from 'markdown-it';
import * as markdownItAnchor from 'markdown-it-anchor';
import * as markdownItFootnote from 'markdown-it-footnote';
import * as markdownItTableOfContents from 'markdown-it-table-of-contents';

export interface IDoc {
  title?: string;
  content: string;
  version: string;
}

interface IDocItem {
  docName: string;
  docTitle: string;
  updatedAt: string;
}

function sdk(config: Config): Sdk {
  return new Sdk(config);
}

export class Sdk {
  public docHelpers: Doc;
  public folderHelpers: Folder;
  public transpiler: MarkdownIt.MarkdownIt;
  public fsApi: FileSystemApi;
  public wikiHelpers: Wiki;

  constructor(public config: Config) {
    this.wikiHelpers = wiki(config);
    this.docHelpers = doc(config);
    this.folderHelpers = folder(config);

    let markdownItEmoji;
    if (config.hasFeature('emojiSupport')) {
      if (config.get('features.emojiSupport.version') === 'light') {
        markdownItEmoji = require('markdown-it-emoji/light');
      } else {
        markdownItEmoji = require('markdown-it-emoji');
      }
    }

    this.transpiler = new MarkdownIt('default', {
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            const pre = hljs.highlight(lang, str, true).value;
            return `<pre class="hljs"><code>${pre}</code></pre>`;
          } catch (__) {
            /**/
          }
        }
        return '';
      },
      linkify: true,
      typographer: true
    })
      .use(markdownItAnchor, {
        level: [1, 2],
        permalink: true
      })
      .use(markdownItTableOfContents)
      .use(markdownItFootnote);

    if (markdownItEmoji) {
      this.transpiler.use(markdownItEmoji);
    }

    this.fsApi = fsApi(config.fsDriver);
  }

  /**
   * Render a markdown string to HTML
   * @param content A markdown string
   */
  public renderToHtml(content: string) {
    return this.transpiler.render(content);
  }

  /**
   * Returns the list of documents in the repository
   * @param into A sub directory below the root
   */
  public async listDocs(into: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot');

    let files = await this.fsApi.scanDir(path.join(docRoot, into), {
      exclude: /^\./,
      includeDirs: false,
      includeFiles: true,
      match: /\.md$/
    });

    files = files.map(file => file.slice(0, -3));
    return files;
  }

  /**
   * Returns the list of folders in the path
   * @param into A sub directory below the root
   */
  public async listFolders(into: string = ''): Promise<IDocItem[] | any> {
    const docRoot = this.config.get('documentRoot');

    const folders = await this.fsApi.scanDir(path.join(docRoot, into), {
      exclude: /^\./,
      includeDirs: true,
      includeFiles: false
    });

    return folders;
  }

  /**
   * Create a doc: proxy call to the saveDoc
   * @param docName
   * @param docContent
   */
  public async createDoc(docName: string, docContent: string, into: string = ''): Promise<void> {
    return this.saveDoc(docName, docContent, into);
  }

  /**
   * Update a doc: proxy call to the saveDoc taking care of renaming the document
   * if the docName has changed
   * @param oldDocName
   * @param docName
   * @param docContent
   * @param into
   */
  public async updateDoc(
    oldDocName: string,
    docName: string,
    docContent: string,
    into: string = ''
  ): Promise<void> {
    // Rename the file (if needed and if possible)
    if (!(await this.renameDoc(oldDocName, docName, into))) {
      throw new Error('Cannot rename a document to an already existant one');
    }

    return this.saveDoc(docName, docContent, into);
  }

  /**
   * Deletes a document from the file system
   * @param docName Id of the document to delete
   */
  public async deleteDoc(docName: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into);
    return this.fsApi.unlink(fullDocName);
  }

  /**
   * Returns whether a document exists or not
   * @param docName Id of the document to check
   * @param into The directory where the document supposedly exists
   */
  public async docExists(docName: string, into: string = ''): Promise<boolean> {
    const fullDocName = this.makeFilename(docName, into);
    return await this.fsApi.access(fullDocName, fs.constants.F_OK);
  }

  /**
   * Renames a document taking care of not overwriting the destination
   * Returns true if the rename is successful, false otherwise
   * @param oldDocName
   * @param newDocName
   * @param into directory where the document resides
   */
  public async renameDoc(
    oldDocName: string,
    newDocName: string,
    into: string = ''
  ): Promise<boolean> {
    if (oldDocName === newDocName) {
      return true;
    }

    const isOverwritable = await this.isOverwritableBy(oldDocName, newDocName, into);
    const docExists = await this.docExists(newDocName, into);

    // A document by the same name already exists and the documents are not
    // really the same (can happen on a case insensitive file system)
    if (docExists && !isOverwritable) {
      return false;
    }

    const fullDocName1 = this.makeFilename(oldDocName, into);
    const fullDocName2 = this.makeFilename(newDocName, into);
    await this.fsApi.rename(fullDocName1, fullDocName2);
    return true;
  }

  /**
   * Check if two docNames point to the same file (the check is
   * needed on case insensitive file systems) thus considering the first
   * docName overridable by the second docName (as file names) without consequences
   * @param docName1 Name of the first doc
   * @param docName2 Name of the second doc
   * @param into directory where the document resides
   */
  public async isOverwritableBy(docName1: string, docName2: string, into: string = '') {
    if (this.config.sys.fileSystemIsCaseSensitive && docName1 !== docName2) {
      return false;
    }

    const fullDocName1 = this.makeFilename(docName1, into);
    const fullDocName2 = this.makeFilename(docName2, into);
    let stat1;
    let stat2;
    try {
      stat1 = await this.fsApi.stat(fullDocName1);
      stat2 = await this.fsApi.stat(fullDocName2);
    } catch (e) {
      // If one of the files doesn't exist, obviously it's OK
      return true;
    }

    return stat1.ino === stat2.ino && stat1.dev === stat2.dev;
  }

  /**
   * Loads a document from the file system or git and returns an IDoc
   * Loads from git when a version is specified that's not HEAD
   * @param docName Id of the document to load
   * @param from A subdirectory where the document can be found
   * @param the version we want, defaults to HEAD
   */
  public async loadDoc(docName: string, from: string = '', version = 'HEAD'): Promise<IDoc> {
    const fullDocName = this.makeFilename(docName, from);
    const title = await this.findDocTitle(docName, from);
    let content;
    if (version === 'HEAD' || !this.config.hasFeature('gitSupport')) {
      content = await this.fsApi.readFile(fullDocName);
    } else {
      content = await git(this.config).$show(docName, from, version);
    }

    return {
      content,
      title
    } as IDoc;
  }

  /**
   * Loads any file from the repository (but doesn't use versioning, hence not git here)
   * @param filepath The path of the file, relative to the documentRoot
   */
  public async loadFile(filepath: string): Promise<string> {
    const fullPathname = this.folderHelpers.fullpathFor(filepath);
    const content = await this.fsApi.readFile(fullPathname);
    return content;
  }

  /**
   * Loads any file from the repository (sync version for Handlebars helpers)
   * @param filepath The path of the file, relative to the documentRoot
   */
  public loadFileSync(filepath: string): string {
    const fullPathname = this.folderHelpers.fullpathFor(filepath);
    const content = this.fsApi.readFileSync(fullPathname);
    return content;
  }

  /**
   * With case insensitive file systems, we need to recover
   * the real title of the document from the real title of
   * the file as we can only get via readdir
   * @param docName The docName
   * @param from The folder the docName is in
   */
  public async findDocTitle(docName: string, from: string = ''): Promise<string> {
    if (this.config.sys.fileSystemIsCaseSensitive) {
      return this.wikiHelpers.unwikify(docName);
    }

    const fullDirname = this.folderHelpers.fullpathFor(from);
    const filenames = await this.fsApi.scanDir(fullDirname as any, {
      includeDirs: false
    });
    const fullFilename = this.docHelpers.docNameToFilename(docName).toUpperCase();
    const titles = filenames.filter(filename => filename.toUpperCase() === fullFilename);

    if (titles.length === 0) {
      throw new Error(`Unable to find anything similar to ${docName}`);
    }

    return this.wikiHelpers.unwikify(this.docHelpers.filenameToDocName(titles[0]));
  }

  /**
   * Returns whether a folder exists or not
   * @param docName Id of the document to check
   * @param into The directory where the folder should be
   */
  public async folderExists(folderName: string, into: string = ''): Promise<boolean> {
    const fullFolderName = this.makeDirname(folderName, into);
    return await this.fsApi.access(fullFolderName, fs.constants.F_OK);
  }

  /**
   * Returns whether a directory is accessible or not (using documentRoot as base)
   * @param docName Id of the document to check
   */
  public async isDirectoryAccessible(directoryName: string): Promise<boolean> {
    const fullDirectoryName = this.folderHelpers.fullpathFor(directoryName);
    return await this.fsApi.access(fullDirectoryName, fs.constants.F_OK);
  }

  /**
   * Create a folder
   * @param folderName
   * @param into The directory where to create the folder
   */
  public async createFolder(folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeDirname(folderName, into);
    await this.fsApi.mkdir(fullFolderName);
  }

  /**
   * Renames a folder taking care of not overwriting the destination
   * Returns true if the rename is succesful, false otherwise
   * @param oldFolderName
   * @param newFolderName
   * @param into The directory where old and new reside
   */
  public async renameFolder(
    oldFolderName: string,
    newFolderName: string,
    into: string = ''
  ): Promise<boolean> {
    if (oldFolderName === newFolderName) {
      return true;
    }

    if (await this.folderExists(newFolderName, into)) {
      return false;
    }

    const fullFolderName1 = this.makeDirname(oldFolderName, into);
    const fullFolderName2 = this.makeDirname(newFolderName, into);
    await this.fsApi.rename(fullFolderName1, fullFolderName2);
    return true;
  }

  /**
   * Deletes a folder from the file system
   * @param folderName Id of the folder to delete
   * @into into Locatio of the folder
   */
  public async deleteFolder(folderName: string, into: string = ''): Promise<void> {
    const fullFolderName = this.makeDirname(folderName, into);
    return this.fsApi.rmdir(fullFolderName);
  }

  /**
   * Saves a document to the file system
   * @param docName Id of the document to save
   * @param docContent Content of the document
   */
  protected async saveDoc(docName: string, docContent: string, into: string = ''): Promise<void> {
    const fullDocName = this.makeFilename(docName, into);
    await this.fsApi.writeFile(fullDocName, docContent);
  }

  protected makeDirname(folderName: string, parentFolder: string) {
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, folderName);
  }

  protected makeFilename(docName: string, parentFolder: string) {
    const docFilename = this.docHelpers.docNameToFilename(docName);
    return path.join(this.folderHelpers.fullpathFor(parentFolder) as any, docFilename as any);
  }
}

export default sdk;
