import { Config } from '@lib/config';
import BaseRoute from '@routes/route';
import { NextFunction, Request, Response, Router } from 'express';
import { isUndefined as _isUndefined } from 'lodash';

export default class IndexRoute extends BaseRoute {
  public static install(router: Router, config: Config) {
    const route = new IndexRoute(config);
    router.get('/', (req: Request, res: Response, next: NextFunction) =>
      route.index(req, res, next)
    );
  }

  public async index(req: Request, res: Response, next: NextFunction) {
    const wikiIndex = this.config.get('wiki.index');

    if (!_isUndefined(req.query.welcome)) {
      if (req.app.get('requiresJson')) {
        const html = await this.renderTemplateToString(res, `${__dirname}/welcome`, {
          documentRoot: this.config.get('documentRoot'),
          wikiIndex
        });
        res.json({
          body: html
        });
      } else {
        this.renderTemplate(res, `${__dirname}/welcome`, {
          documentRoot: this.config.get('documentRoot'),
          wikiIndex
        });
      }
    } else {
      const indexPageUrl = this.wikiHelpers.pathFor(wikiIndex);
      res.redirect(indexPageUrl);
    }
  }
}
