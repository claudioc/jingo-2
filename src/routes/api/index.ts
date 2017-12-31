import { Config } from '@lib/config'
import sdk, { Sdk } from '@sdk'
import { NextFunction, Request, Response, Router } from 'express'
import * as send from 'send'

export default class ApiRoute {
  sdk: Sdk

  constructor (public config: Config) {
    this.sdk = sdk(this.config)
  }

  public static create (router: Router, config: Config) {
    const proxyPath = config.get('proxyPath')

    /**
     * Renders a markdown string to html
     */
    router.post(`${proxyPath}api/render`, (req: Request, res: Response, next: NextFunction) => {
      new ApiRoute(config).renderMarkdown(req, res, next)
    })

    /**
     * Serves static content directly from the repository
     */
    router.get(`${proxyPath}api/serve-static/*`, (req: Request, res: Response, next: NextFunction) => {
      new ApiRoute(config).serveStatic(req, res, next)
    })
  }

  public async renderMarkdown (req: Request, res: Response, next: NextFunction) {
    const renderedContent = this.sdk.renderToHtml(req.body.content)
    res.status(200).send(renderedContent)
  }

  public async serveStatic (req: Request, res: Response, next: NextFunction) {
    const assetName = req.params[0] || ''

    if (assetName === '' || (!assetName.endsWith('.js') && !assetName.endsWith('.css'))) {
      return res.status(404).send('Not found')
    }

    const sendOpts = {
      index: false,
      root: this.config.get('documentRoot')
    }

    send(req, assetName, sendOpts).pipe(res)
  }
}
