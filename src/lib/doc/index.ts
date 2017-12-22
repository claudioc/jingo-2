import { Config } from '@lib/config'
import wiki, { Wiki } from '@lib/wiki'
import * as path from 'path'

type DocAction = 'delete' | 'update' | 'create'
type PathParts = {
  dirName: string
  docName: string
}

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
   * @param into The folder the document is in
   * @param action DocAction
   */
  public pathFor (action: DocAction, docName: string, into: string = ''): string {
    let docPath = `/doc/${action}`
    if (docName) {
      docPath += `/${this.wikiHelpers.wikify(docName)}`
    }

    if (into && into.length > 0) {
      docPath += `?into=${encodeURIComponent(into)}`
    }

    return docPath
  }

  /**
   * Returns the formatted Md filename of a document
   * @param docName Id of the document
   */
  public filenameFor (docName: string): string {
    return docName.endsWith('.md') ? docName : `${docName}.md`
  }

  /**
   * Parses a path and split it into a `dirName` and a `docName`
   * For consistency we always returns the dirname as a relative
   * path, which means that `` represents the `documentRoot`
   * @param unparsed The full path to parse
   * @returns PathParts
   */
  public parsePath (unparsed: string): PathParts {
    const normalizedPath = (unparsed || '').trim()

    // The `path.parse` method ignores leading slashes and
    // uses the last part of the path as the `name` so we need
    // to put that piece back in place
    let { dir, name } = path.parse(normalizedPath)
    if (normalizedPath.endsWith('/')) {
      dir = path.join(dir, name)
      name = ''
    }

    return {
      dirName: dir.replace(/^\/+/g, ''),
      docName: name
    }
  }
}

export default doc
