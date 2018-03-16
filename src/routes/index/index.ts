import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { isUndefined as _isUndefined } from 'lodash'

export default class IndexRoute extends BaseRoute {
  public static create(router: Router, config: Config) {
    const route = new IndexRoute(config)
    router.get('/', (req: Request, res: Response, next: NextFunction) =>
      route.index(req, res, next)
    )
  }

  public index(req: Request, res: Response, next: NextFunction) {
    const wikiIndex = this.config.get('wiki.index')

    if (!_isUndefined(req.query.welcome)) {
      this.render(req, res, 'welcome', {
        documentRoot: this.config.get('documentRoot'),
        wikiIndex
      })
    } else {
      const indexPageUrl = this.wikiHelpers.pathFor(wikiIndex)
      res.redirect(indexPageUrl)
    }
  }
}
