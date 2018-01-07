import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { isUndefined as _isUndefined } from 'lodash'

export default class IndexRoute extends BaseRoute {
  public static create (router: Router, config: Config) {
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute(config).index(req, res, next)
    })
  }

  public index (req: Request, res: Response, next: NextFunction) {
    if (!_isUndefined(req.query.welcome)) {
      this.render(req, res, 'welcome', {
        documentRoot: this.config.get('documentRoot'),
        wikiIndex: this.config.get('wiki.index')
      })
    } else {
      const index = this.config.get('wiki.index')
      const indexPageUrl = this.wikiHelpers.pathFor(index)
      res.redirect(indexPageUrl)
    }
  }
}
