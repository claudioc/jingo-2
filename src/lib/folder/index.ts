import { Config } from '@lib/config'
import * as fs_ from 'fs'
import * as path from 'path'
import * as qs from 'querystring'

type FolderAction = 'create' | 'list' | 'rename'
type FolderPathParts = {
  parentDirName: string
  folderName: string
}

function folder (config: Config): Folder {
  return new Folder(config)
}

export class Folder {
  constructor (public config: Config) {
  }

  /**
   * Returns the URL path for a folder action
   * @param action FolderAction
   * @param folderName Name of the folder to act upon
   * @param into The name of the parent folder
   */
  public pathFor (action: FolderAction, folderName: string = '', into: string = ''): string {
    let actionPath = `/folder/${action}`
    const queryMap = new Map()
    if (action === 'list') {
      // Encode the name, but do not encode slashes in it
      let folderPath = encodeURIComponent(folderName.replace(/^\/+|\/+$/g, '').trim()).replace(/%2F/g, '/')
      folderPath += folderPath.length > 0 ? '/' : ''
      actionPath = `/${this.config.get('wiki.basePath')}/${folderPath}`
    }

    if (action === 'rename' && folderName.length > 0) {
      queryMap.set('folderName', folderName)
    }

    if (into && into.length > 0) {
      queryMap.set('into', into)
    }

    if (queryMap.size > 0) {
      const query = {}
      queryMap.forEach((v, k) => query[k] = v)
      actionPath += `?${qs.stringify(query)}`
    }

    return actionPath
  }

  /**
   * Returns the full file system path of a folder
   * @param id The path of the folder
   */
  public fullpathFor (id: string): fs_.PathLike {
    const docRoot = this.config.get('documentRoot')
    return path.resolve(docRoot, id)
  }

  /**
   * Parses a path and split it into a `parentDirName` and a `folderName`
   * @param unparsed The full path to parse
   * @returns FolderPathParts
   */
  public parsePath (unparsed: string): FolderPathParts {
    const normalizedPath = (unparsed || '').trim()

    const { dir, name } = path.parse(normalizedPath)

    return {
      folderName: name,
      parentDirName: dir
    }
  }
}

export default folder
