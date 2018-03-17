import { Config } from '@lib/config'
import { validateCreate } from '@lib/validators/doc'
import csrfMiddleware from '@middlewares/csrf'
import gitRequiredMiddleware from '@middlewares/git-required'
import BaseRoute from '@routes/route'
import { Request, Response, Router } from 'express'

import { get as get_docCreate, post as post_docCreate } from './create'
import { get as get_docDelete, post as post_docDelete } from './delete'
import { get as get_docHistory } from './history'
import { get as get_docRecent } from './recent'
import { get as get_docRestore, post as post_docRestore } from './restore'
import { get as get_docUpdate, post as post_docUpdate } from './update'

export default class DocRoute extends BaseRoute {
  public static create(router: Router, config: Config) {
    const csrfProtection = csrfMiddleware(config)
    const gitRequired = gitRequiredMiddleware(config)

    const route = new DocRoute(config)

    router.get('/doc/create', csrfProtection, get_docCreate(route))
    router.post('/doc/create', [csrfProtection, validateCreate()], post_docCreate(route))

    router.get('/doc/update', csrfProtection, get_docUpdate(route))
    router.post('/doc/update', [csrfProtection, validateCreate()], post_docUpdate(route))

    router.get('/doc/delete', csrfProtection, get_docDelete(route))
    router.post('/doc/delete', csrfProtection, post_docDelete(route))

    router.get('/doc/history', gitRequired, get_docHistory(route))

    router.get('/doc/restore', [gitRequired, csrfProtection], get_docRestore(route))
    router.post('/doc/restore', [gitRequired, csrfProtection], post_docRestore(route))

    router.get('/doc/recent', [gitRequired], get_docRecent(route))
  }

  public async assertDirectoryExists(directory, req: Request, res: Response): Promise<boolean> {
    if (!directory) {
      return true
    }

    const { folderName, parentDirname } = this.folderHelpers.splitPath(directory)
    const itExists = await this.sdk.folderExists(folderName, parentDirname)
    if (!itExists) {
      this.render(req, res, 'doc-fail', {
        directory,
        folderName,
        parentDirname
      })
    }

    return itExists
  }

  public async assertDocDoesNotExist(docName, into, req: Request, res: Response) {
    if (!docName) {
      return true
    }

    const itExists = await this.sdk.docExists(docName, into)
    if (itExists) {
      res.redirect(this.wikiHelpers.pathFor(docName))
    }

    return !itExists
  }

  public async assertDocExists(docName, into, req: Request, res: Response) {
    const itExists = await this.sdk.docExists(docName, into)
    if (!itExists) {
      res.redirect(this.config.mount('/?e=1'))
    }

    return itExists
  }
}
