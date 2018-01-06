import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import sdk, { Sdk } from '@sdk'
import { NextFunction, Request, Response, Router } from 'express'
import * as send from 'send'

export default class ApiRoute {
  sdk: Sdk
  docHelpers: Doc

  constructor (public config: Config) {
    this.sdk = sdk(this.config)
    this.docHelpers = doc(this.config)
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

    /**
     * Serves the rendered content of a page
     */
    router.get(`${proxyPath}api/wiki/*`, (req: Request, res: Response, next: NextFunction) => {
      new ApiRoute(config).wikiRender(req, res, next)
    })
  }

  public async wikiRender (req: Request, res: Response, next: NextFunction) {
    const reqPath = req.params[0]
    const { dirName, docName } = this.docHelpers.splitPath(reqPath)

    try {
      const document = await this.sdk.loadDoc(docName, dirName)
      res.send(this.sdk.renderToHtml(document.content))
    } catch (e) {
      res.boom.notFound('Not found')
    }
  }

  public async renderMarkdown (req: Request, res: Response, next: NextFunction) {
    const renderedContent = this.sdk.renderToHtml(req.body.content)
    res.send(renderedContent)
  }

  public async serveStatic (req: Request, res: Response, next: NextFunction) {
    const assetName = req.params[0] || ''

    if (assetName === '' || (!assetName.endsWith('.js') && !assetName.endsWith('.css'))) {
      return res.boom.notFound('Not found')
    }

    const sendOpts = {
      index: false,
      root: this.config.get('documentRoot')
    }

    send(req, assetName, sendOpts).pipe(res)
  }
}
