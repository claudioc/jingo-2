import { NextFunction, Request, Response, Router } from 'express'
import * as MarkdownIt from 'markdown-it'
import { docPathFor, loadDoc } from '../lib/doc'
import { convertToTitle } from '../lib/wiki'
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

  public renderDoc (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = convertToTitle(docName)

    this.title = `Jingo – ${docTitle}`

    loadDoc(docTitle)
      .then(doc => {
        const scope: object = {
          content: this.parser.render(doc.content),
          title: docTitle
        }

        this.render(req, res, 'wiki', scope)
      })
      .catch(() => {
        const createPageUrl = docPathFor(docTitle, 'new')
        res.redirect(createPageUrl)
      })
  }
}
