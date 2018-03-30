import { Config } from '@lib/config'
import { validateCreate, validateRename } from '@lib/validators/folder'
import csrfMiddleware from '@middlewares/csrf'
import BaseRoute from '@routes/route'
import { Request, Response, Router } from 'express'

import { get as get_folderCreate, post as post_folderCreate } from './create'
import { get as get_folderDelete, post as post_folderDelete } from './delete'
import { get as get_folderRename, post as post_folderRename } from './rename'

export default class FolderRoute extends BaseRoute {
  public static create(router: Router, config: Config) {
    const csrfProtection = csrfMiddleware(config)
    const route = new FolderRoute(config)

    router.get(`/folder/create`, csrfProtection, get_folderCreate(route))
    router.post(`/folder/create`, [csrfProtection, validateCreate()], post_folderCreate(route))

    router.get(`/folder/rename`, csrfProtection, get_folderRename(route))
    router.post(`/folder/rename`, [csrfProtection, validateRename()], post_folderRename(route))

    router.get(`/folder/delete`, csrfProtection, get_folderDelete(route))
    router.post(`/folder/delete`, csrfProtection, post_folderDelete(route))
  }

  public async assertDirectoryExists(directory, req: Request, res: Response): Promise<boolean> {
    if (!directory) {
      return true
    }

    const { folderName, parentDirname } = this.folderHelpers.splitPath(directory)
    const itExists = await this.sdk.folderExists(folderName, parentDirname)
    if (!itExists) {
      this.renderTemplate(res, `${__dirname}/fail`, {
        directory,
        folderName,
        parentDirname
      })
    }

    return itExists
  }

  public async assertFolderDoesNotExist(
    folder,
    into,
    req: Request,
    res: Response
  ): Promise<boolean> {
    if (!folder) {
      return true
    }

    const itExists = await this.sdk.folderExists(folder, into)
    if (itExists) {
      res.redirect(this.folderHelpers.pathFor('list', folder, into))
    }

    return !itExists
  }

  public async assertFolderExists(folder, into, req: Request, res: Response) {
    const itExists = await this.sdk.folderExists(folder, into)
    if (!itExists) {
      res.redirect(this.config.mount(`/?e=1`))
    }

    return itExists
  }
}
