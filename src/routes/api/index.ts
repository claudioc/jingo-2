import { Config } from '@lib/config'
import sdk from '@sdk'
import { NextFunction, Request, Response, Router } from 'express'

export default class ApiRoute {
  constructor (public config: Config) {
  }

  public static create (router: Router, config: Config) {
    router.post('/api/render', (req: Request, res: Response, next: NextFunction) => {
      new ApiRoute(config).render(req, res, next)
    })
  }

  public async render (req: Request, res: Response, next: NextFunction) {
    const renderedContent = sdk(this.config).renderToHtml(req.body.content)
    res.status(200).send(renderedContent)
  }
}
