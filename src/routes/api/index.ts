import { Config } from '@lib/config'
import sdk, { Sdk } from '@sdk'
import { NextFunction, Request, Response, Router } from 'express'

export default class ApiRoute {
  sdk: Sdk

  constructor (public config: Config) {
    this.sdk = sdk(this.config)
  }

  public static create (router: Router, config: Config) {
    const proxyPath = config.get('proxyPath')

    router.post(`${proxyPath}api/render`, (req: Request, res: Response, next: NextFunction) => {
      new ApiRoute(config).renderMarkdown(req, res, next)
    })
  }

  public async renderMarkdown (req: Request, res: Response, next: NextFunction) {
    const renderedContent = this.sdk.renderToHtml(req.body.content)
    res.status(200).send(renderedContent)
  }
}
