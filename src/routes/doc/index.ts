import { NextFunction, Request, Response, Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import { matchedData, sanitize } from 'express-validator/filter'
import { wikiPathFor } from '../../lib/wiki'
import { unwikify } from '../../lib/wiki'
import { BaseRoute } from '../route'

// Returns a validator chains for the new document
function validatesNew () {
  return [
    check('docName')
      .isLength({ min: 1 })
      .withMessage('The document name cannot be empty')
      .trim(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim(),

    sanitize(['docName', 'content'])
  ]
}

export default class DocRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/doc/new/:docName?', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute().newDoc(req, res, next)
    })

    router.post('/doc/new', validatesNew(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute().createDoc(req, res, next)
    })
  }

  public newDoc (req: Request, res: Response, next: NextFunction) {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docName = req.params.docName || ''
    const docTitle = unwikify(docName)

    const scope: object = {
      docName,
      docTitle: docTitle !== '' ? docTitle : 'new document'
    }

    this.render(req, res, 'doc-new', scope)
  }

  public createDoc (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    const hasErrors = !errors.isEmpty()

    const data = matchedData(req)

    if (hasErrors) {
      const scope: object = {
        content: data.content,
        docName: data.docName,
        docTitle: data.docName,
        errors: errors.mapped()
      }

      console.log(errors.mapped())
      this.render(req, res, 'doc-new', scope)
      return
    }

    res.redirect(wikiPathFor(data.docName))
  }
}
