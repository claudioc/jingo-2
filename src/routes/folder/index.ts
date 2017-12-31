import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { check } from 'express-validator/check'
import { sanitize } from 'express-validator/filter'
import { assign as _assign } from 'lodash'

const validatesCreate = () => {
  return [
    check('folderName')
      .isLength({ min: 1 })
      .withMessage('The folder title cannot be empty')
      .trim(),

    check('into')
      .trim(),

    sanitize(['folderName', 'into'])
  ]
}

const validatesRename = () => {
  return [
    check('folderName')
      .isLength({ min: 1 })
      .withMessage('The folder title cannot be empty')
      .trim(),

    check('currentFolderName')
      .isLength({ min: 1 })
      .trim(),

    check('into')
      .trim(),

    sanitize(['folderName', 'currentFolderName', 'into'])
  ]
}

export default class FolderRoute extends BaseRoute {
  public static create (router: Router, config: Config) {
    const proxyPath = config.get('proxyPath')

    router.get(`${proxyPath}folder/create`, (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).create(req, res, next)
    })

    router.post(`${proxyPath}folder/create`, validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didCreate(req, res, next)
    })

    router.get(`${proxyPath}folder/rename`, (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).rename(req, res, next)
    })

    router.post(`${proxyPath}folder/rename`, validatesRename(), (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didRename(req, res, next)
    })

    router.get(`${proxyPath}folder/delete`, (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).delete(req, res, next)
    })

    router.post(`${proxyPath}folder/delete`, (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didDelete(req, res, next)
    })
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a folder'
    const into = req.query.into || ''
    const folderName = req.query.folderName || ''

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!await this.assertFolderDoesNotExist(folderName, into, req, res)) {
      return
    }

    const scope = {
      folderName,
      into
    }

    this.render(req, res, 'folder-create', scope)
  }

  public async didCreate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const folderName = data.folderName
    const into = data.into

    const scope: object = {
      folderName,
      into
    }

    if (errors) {
      this.render(req, res, 'folder-create', _assign(scope, { errors }))
      return
    }

    const itExists = await this.sdk.folderExists(folderName, into)
    if (itExists) {
      this.render(req, res, 'folder-create', _assign(scope, { errors: ['A folder or file with this name already exists'] }))
      return
    }

    try {
      await this.sdk.createFolder(folderName, into)
      // All done, go to the just created folder
      res.redirect(this.folderHelpers.pathFor('list', into))
    } catch (err) {
      res.status(500).render('500')
    }
  }

  public async rename (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a folder'
    const folderName = req.query.folderName || ''
    const into = req.query.into || ''

    if (folderName === '') {
      return res.status(400).render('400')
    }

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!this.assertFolderExists(folderName, into, req, res)) {
      return
    }

    const scope = {
      folderName,
      into
    }

    this.render(req, res, 'folder-rename', scope)
  }

  public async didRename (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const folderName = data.folderName
    const currentFolderName = data.currentFolderName
    const into = data.into

    const scope: object = {
      folderName,
      into
    }

    if (errors) {
      return this.render(req, res, 'folder-rename', _assign(scope, { errors }))
    }

    await this.sdk.renameFolder(currentFolderName, folderName, into)

    res.redirect(this.folderHelpers.pathFor('list', into))
  }

  public async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Deleting a folder'
    const folderName = req.query.folderName || ''
    const into = req.query.into || ''

    if (folderName === '') {
      return res.status(400).render('400')
    }

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!this.assertFolderExists(folderName, into, req, res)) {
      return
    }

    const scope: object = {
      folderName,
      into
    }

    this.render(req, res, 'folder-delete', scope)
  }

  public async didDelete (req: Request, res: Response, next: NextFunction): Promise<void> {
    const folderName = req.body.folderName
    const into = req.body.into

    if (!this.assertFolderExists(folderName, into, req, res)) {
      return
    }

    await this.sdk.deleteFolder(folderName, into)

    res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0')
  }

  private async assertDirectoryExists (directory, req: Request, res: Response): Promise<boolean> {
    if (!directory) {
      return true
    }

    const { folderName, parentDirname } = this.folderHelpers.splitPath(directory)
    const itExists = await this.sdk.folderExists(folderName, parentDirname)
    if (!itExists) {
      this.render(req, res, 'folder-fail', {
        directory,
        folderName,
        parentDirname
      })
    }

    return itExists
  }

  private async assertFolderDoesNotExist (folder, into, req: Request, res: Response): Promise<boolean> {
    if (!folder) {
      return true
    }

    const itExists = await this.sdk.folderExists(folder, into)
    if (itExists) {
      res.redirect(this.folderHelpers.pathFor('list', folder, into))
    }

    return !itExists
  }

  private async assertFolderExists (folder, into, req: Request, res: Response) {
    const itExists = await this.sdk.folderExists(folder, into)
    if (!itExists) {
      res.redirect(`${this.config.get('proxyPath')}?e=1`)
    }

    return itExists
  }
}
