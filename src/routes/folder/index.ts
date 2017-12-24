import api from '@api'
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
    router.get('/folder/create', (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).create(req, res, next)
    })

    router.post('/folder/create', validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didCreate(req, res, next)
    })

    router.get('/folder/rename', (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).rename(req, res, next)
    })

    router.post('/folder/rename', validatesRename(), (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didRename(req, res, next)
    })

    router.get('/folder/delete', (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).delete(req, res, next)
    })

    router.post('/folder/delete', (req: Request, res: Response, next: NextFunction) => {
      new FolderRoute(config).didDelete(req, res, next)
    })
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a folder'
    const scope = {
      into: req.query.into || ''
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

    const itExists = await api(this.config).folderExists(folderName, into)
    if (itExists) {
      this.render(req, res, 'folder-create', _assign(scope, { errors: ['A folder or file with this name already exists'] }))
      return
    }

    try {
      await api(this.config).createFolder(folderName, into)
      // All done, go to the just created folder
      res.redirect(this.folderHelpers.pathFor('list', into))
    } catch (err) {
      res.status(500).render('500')
    }
  }

  public async rename (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a folder'
    const folderName = req.query.folderName || ''
    const into = req.query.into

    if (folderName === '') {
      return res.status(400).render('400')
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

    await api(this.config).renameFolder(currentFolderName, folderName, into)

    res.redirect(this.folderHelpers.pathFor('list', into))
  }

  public async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Deleting a folder'
    const folderName = req.query.folderName
    const into = req.query.into || ''

    const itExists = await api(this.config).folderExists(folderName, into)
    if (!itExists) {
      res.redirect('/?e=1')
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

    const itExists = await api(this.config).folderExists(folderName, into)
    if (!itExists) {
      res.redirect('/?e=1')
      return
    }

    await api(this.config).deleteFolder(folderName, into)

    res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0')
  }
}
