import { wikiPathFor } from '@lib/wiki'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'

export default class IndexRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute().index(req, res, next)
    })
  }

  public index (req: Request, res: Response, next: NextFunction) {
    const indexPageUrl = wikiPathFor('Home')
    res.redirect(indexPageUrl)
  }
}
