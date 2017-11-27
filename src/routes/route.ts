import { Config } from '@lib/config'
import { Request, Response } from 'express'

export default class BaseRoute {

  constructor (public config: Config, public title: string = 'Jingo') {
  }

  public render (req: Request, res: Response, view: string, options?: object) {
    res.locals.BASE_URL = '/'
    res.locals.title = this.title
    res.render(view, options)
  }
}
