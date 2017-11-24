import { NextFunction, Request, Response, Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import { matchedData, sanitize } from 'express-validator/filter'
import api from '../../api'
import config from '../../lib/config'
import { unwikify, wikiPathFor } from '../../lib/wiki'
import { BaseRoute } from '../route'

// Returns a validator chains for the new document
function validatesNew () {
  console.log(config.get('topa'))
  return [
    check('docTitle')
      .isLength({ min: 1 })
      .withMessage('The document title cannot be empty')
      .trim(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim(),

    sanitize(['docTitle', 'content'])
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

  public newDoc (req: Request, res: Response, next: NextFunction): void {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docTitle = unwikify(req.params.docName || '')

    const scope: object = {
      docTitle: docTitle !== '' ? docTitle : 'Unnamed document'
    }

    this.render(req, res, 'doc-new', scope)
  }

  public async createDoc (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)

    if (errors) {
      const scope: object = {
        content: data.content,
        docTitle: data.docTitle,
        errors
      }

      this.render(req, res, 'doc-new', scope)
      return
    }

    await api.createDoc(data.docTitle, data.content)

    // All done, go to the just saved page
    res.redirect(wikiPathFor(data.docTitle))
  }

  public inspectRequest (req: Request) {
    const validationErrors = validationResult(req)

    return {
      data: matchedData(req),
      errors: validationErrors.isEmpty() ? null : validationErrors.mapped()
    }
  }
}
