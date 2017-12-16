import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import wiki, { Wiki } from '@lib/wiki'
import { Request, Response } from 'express'

export default class BaseRoute {
  public wikiHelpers: Wiki
  public docHelpers: Doc

  constructor (public config: Config, public title: string = 'Jingo') {
    this.wikiHelpers = wiki(this.config)
    this.docHelpers = doc(this.config)
  }

  public render (req: Request, res: Response, view: string, options?: object) {
    res.locals.BASE_URL = '/'
    res.locals.title = this.title
    res.render(view, options)
  }
}
