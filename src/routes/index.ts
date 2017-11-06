import { NextFunction, Request, Response, Router } from 'express'
import { convertToWikiPath } from '../lib/wiki'
import { BaseRoute } from './route'

export class IndexRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute().index(req, res, next)
    })
  }

  public index (req: Request, res: Response, next: NextFunction) {
    const indexPageUrl = convertToWikiPath('Home')
    res.redirect(indexPageUrl)
  }
}
