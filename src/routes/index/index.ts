import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'

export default class IndexRoute extends BaseRoute {
  public static create (router: Router, config: Config) {
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute(config).index(req, res, next)
    })
  }

  public index (req: Request, res: Response, next: NextFunction) {
    const indexPageUrl = this.wikiHelpers.wikiPathFor('Home')
    res.redirect(indexPageUrl)
  }
}
