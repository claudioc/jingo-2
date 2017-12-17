import { Config } from '@lib/config'
import * as fs_ from 'fs'
import * as path from 'path'

type FolderAction = 'create' | 'list'

function folder (config: Config): Folder {
  return new Folder(config)
}

export class Folder {
  constructor (public config: Config) {
  }

  /**
   * Returns the URL path for a document action
   * @param action FolderAction
   * @param folderName the name of the folder
   */
  public pathFor (action: FolderAction, folderName: string = ''): string {
    let actionPath = `/folder/${action}`
    if (action === 'list') {
      folderName = encodeURIComponent(folderName.replace(/^\/+|\/+$/g, '').trim())
      folderName += folderName.length > 0 ? '/' : ''
      actionPath = `/${this.config.get('wiki.basePath')}/${folderName}`
    }
    return actionPath
  }

  /**
   * Returns the full file system path of a folder
   * @param folderName The path of the folder
   */
  public fullpathFor (folderName: string): fs_.PathLike {
    const docRoot = this.config.get('documentRoot')
    return path.resolve(docRoot, folderName)
  }
}

export default folder
