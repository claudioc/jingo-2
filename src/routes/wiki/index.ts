import api from '@api'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import * as MarkdownIt from 'markdown-it'

export default class WikiRoute extends BaseRoute {
  parser: MarkdownIt.MarkdownIt

  constructor (config) {
    super(config)
    this.parser = new MarkdownIt()
  }

  public static create (router: Router, config: Config) {
    const basePath = config.get('wiki.basePath')

    /**
     * The catch-all route for all the route request:
     * - /wiki/docname: will render `docname`
     * - /wiki/dir/: will render the list in `dir`
     * - /wiki/dir/docname: will render docname in `dir`
     */
    router.get(`/${basePath}*`, (req: Request, res: Response, next: NextFunction) => {
      const path = req.params[0]
      delete req.params[0]

      if (path.length === 0) {
        res.redirect(`/${basePath}/`)
        return
      }

      req.params.path = path
      const method = path.endsWith('/') ? 'list' : 'read';
      (new WikiRoute(config))[method](req, res, next)
    })
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    const { docName } = this.docHelpers.parsePath(req.params.path)
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
    const { dirName } = this.docHelpers.parsePath(req.params.path)

    this.title = `Jingo – List of documents`

    let list
    try {
      list = await api(this.config).listDocs(dirName)
    } catch (err) {
      res.status(404).render('404')
      return
    }

    const scope = {
      list
    }
    this.render(req, res, 'wiki-list', scope)
  }
}
