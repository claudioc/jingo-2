import { Request, Response } from 'express'

export default class BaseRoute {

  public title: string

  private scripts: string[]

  constructor () {
    this.title = 'Jingo'
    this.scripts = []
  }

  public addScript (src: string): BaseRoute {
    this.scripts.push(src)
    return this
  }

  public render (req: Request, res: Response, view: string, options?: object) {
    res.locals.BASE_URL = '/'
    res.locals.scripts = this.scripts
    res.locals.title = this.title
    res.render(view, options)
  }
}
