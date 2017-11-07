import { NextFunction, Request, Response, Router } from 'express'
import { convertToTitle } from '../lib/wiki'
import { BaseRoute } from './route'

export class DocRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/doc/:docName/new', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute().newDoc(req, res, next)
    })
  }

  public newDoc (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = convertToTitle(docName)

    this.title = `Jingo – Creating ${docTitle}`

    const scope: object = {
      title: docTitle
    }

    this.render(req, res, 'doc-new', scope)
  }
}
