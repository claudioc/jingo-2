import { NextFunction, Request, Response, Router } from 'express'
import * as MarkdownIt from 'markdown-it'
import { docPathFor, loadDoc } from '../lib/doc'
import { unwikify } from '../lib/wiki'
import { BaseRoute } from './route'

export class WikiRoute extends BaseRoute {
  parser: MarkdownIt.MarkdownIt

  constructor () {
    super()
    this.parser = new MarkdownIt()
  }

  public static create (router: Router) {
    router.get('/wiki/:docName', (req: Request, res: Response, next: NextFunction) => {
      new WikiRoute().renderDoc(req, res, next)
    })
  }

  public async renderDoc (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = unwikify(docName)

    this.title = `Jingo – ${docTitle}`

    try {
      const doc = await loadDoc(docTitle)
      const scope: object = {
        content: this.parser.render(doc.content),
        title: docTitle
      }
      this.render(req, res, 'wiki', scope)
    } catch (e) {
      const createPageUrl = docPathFor(docTitle, 'new')
      res.redirect(createPageUrl)
    }
  }
}
