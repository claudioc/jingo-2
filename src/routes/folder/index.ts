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

    sanitize(['folderName'])
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
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a folder'
    this.render(req, res, 'folder-create')
  }

  public async didCreate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const folderName = data.folderName

    const scope: object = {
      folderName
    }

    if (errors) {
      this.render(req, res, 'folder-create', _assign(scope, { errors }))
      return
    }

    const itExists = await api(this.config).folderExists(folderName)
    if (itExists) {
      this.render(req, res, 'folder-create', _assign(scope, { errors: ['A folder or file with this name already exists'] }))
      return
    }

    try {
      await api(this.config).createFolder(folderName)
      // All done, go to the just created folder
      res.redirect(this.folderHelpers.pathFor('list', folderName))
    } catch (err) {
      res.status(500).render('500')
    }
  }
}
