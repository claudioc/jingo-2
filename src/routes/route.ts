import { Request, Response } from 'express'

/**
 * Constructor
 *
 * @class BaseRoute
 */
export class BaseRoute {

  protected title: string

  private scripts: string[]

  /**
   * Constructor
   *
   * @class BaseRoute
   * @constructor
   */
  constructor () {
    this.title = 'Jingo'
    this.scripts = []
  }

  /**
   * Add a JS external file to the request.
   *
   * @class BaseRoute
   * @method addScript
   * @param src {string} The src to the external JS file.
   * @return {BaseRoute} Self for chaining
   */
  public addScript (src: string): BaseRoute {
    this.scripts.push(src)
    return this
  }

  /**
   * Render a page.
   *
   * @class BaseRoute
   * @method render
   * @param req {Request} The request object.
   * @param res {Response} The response object.
   * @param view {String} The view to render.
   * @param options {Object} Additional options to append to the view's local scope.
   * @return void
   */
  public render (req: Request, res: Response, view: string, options?: object) {
    res.locals.BASE_URL = '/'
    res.locals.scripts = this.scripts
    res.locals.title = this.title
    res.render(view, options)
  }
}
