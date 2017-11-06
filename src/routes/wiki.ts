import { NextFunction, Request, Response, Router } from 'express'
import { convertToTitle } from '../lib/wiki'
import { BaseRoute } from './route'

export class WikiRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/wiki/:docName', (req: Request, res: Response, next: NextFunction) => {
      new WikiRoute().renderDoc(req, res, next)
    })
  }

  public renderDoc (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = convertToTitle(docName)
    this.title = `Jingo – ${docTitle}`

    const options: object = {
      title: docTitle
    }

    this.render(req, res, 'wiki', options)
  }
}
