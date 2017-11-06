import { NextFunction, Request, Response, Router } from 'express'
import { BaseRoute } from './route'

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor () {
    super()
  }

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create (router: Router) {
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute().index(req, res, next)
    })
  }

  /**
   * The home page route.
   *
   * @class IndexRoute
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index (req: Request, res: Response, next: NextFunction) {
    this.title = 'Jingo'

    const options: object = {
      message: 'Welcome to Jingo'
    }

//    const indexPageUrl = this.resolveWikiName(app.locals.config.get('pages').index)
    // res.redirect(indexPageUrl)
    // res.redirect(proxyPath + '/wiki/' + app.locals.config.get('pages').index)
    this.render(req, res, 'index', options)
  }
}
