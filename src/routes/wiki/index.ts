import api from '@api'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import * as MarkdownIt from 'markdown-it'

export default class WikiRoute extends BaseRoute {
  parser: MarkdownIt.MarkdownIt

  constructor (cfg) {
    super(cfg)
    this.parser = new MarkdownIt()
  }

  public static create (router: Router, config: Config) {
    const basePath = config.get('wiki.basePath')
    router.get(`/${basePath}`, (req: Request, res: Response, next: NextFunction) => {
      new WikiRoute(config).list(req, res, next)
    })

    router.get(`/${basePath}/:docName`, (req: Request, res: Response, next: NextFunction) => {
      new WikiRoute(config).read(req, res, next)
    })
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = this.wikiHelpers.unwikify(docName)

    this.title = `Jingo – ${docTitle}`

    try {
      const doc = await api(this.config).loadDoc(docName)
      const scope: object = {
        content: this.parser.render(doc.content),
        docName,
        docTitle
      }
      this.render(req, res, 'wiki-read', scope)
    } catch (e) {
      const createPageUrl = this.docHelpers.docPathFor(docTitle, 'create')
      res.redirect(createPageUrl)
    }
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.title = `Jingo – List of documents`

    const list = await api(this.config).listDocs()

    const scope = {
      list
    }
    this.render(req, res, 'wiki-list', scope)
  }
}
