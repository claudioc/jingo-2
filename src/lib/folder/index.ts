import { Config } from '@lib/config'
import Queso from '@lib/queso'
import * as fs_ from 'fs'
import * as path from 'path'

type FolderAction = 'create' | 'list' | 'rename' | 'delete'
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
    const queso = new Queso()

    if (action === 'list') {
      // Encode the name, but do not encode slashes in it
      let folderPath = encodeURIComponent(folderName.replace(/^\/+|\/+$/g, '').trim()).replace(/%2F/g, '/')
      folderPath += folderPath.length > 0 ? '/' : ''
      // When into and folderPath are empty, path.join returns a '.'
      folderPath = path.join(into, folderPath).replace(/^\.$/, '')
      actionPath = `/${this.config.get('wiki.basePath')}/${folderPath}`
    }

    if ((action === 'rename' || action === 'delete') && folderName.length > 0) {
      queso.add('folderName', folderName)
    }

    if (action !== 'list' && into && into.length > 0) {
      queso.add('into', into)
    }

    return actionPath + queso.stringify()
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
