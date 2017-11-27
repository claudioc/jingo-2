import api from '@api'
import config from '@lib/config'
import { unwikify, wikiPathFor } from '@lib/wiki'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import { matchedData, sanitize } from 'express-validator/filter'

// Returns a validator chains for the new document
function validatesNew () {
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
  public static create (router: Router) {
    router.get('/doc/new/:docName?', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).newDoc(req, res, next)
    })

    router.post('/doc/new', validatesNew(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).createDoc(req, res, next)
    })
  }

  public async newDoc (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docTitle = unwikify(req.params.docName || '')
    const hasDocTitle = docTitle !== ''

    // If a document with this name already exists, bring the user there
    if (hasDocTitle) {
      const itExists = await api(this.config).docExists(docTitle)
      if (itExists) {
        res.redirect(wikiPathFor(docTitle))
        return
      }
    }

    const scope: object = {
      docTitle: hasDocTitle ? docTitle : 'Unnamed document'
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

    await api(this.config).createDoc(data.docTitle, data.content)

    // All done, go to the just saved page
    res.redirect(wikiPathFor(data.docTitle))
  }

  public inspectRequest (req: Request) {
    const validationErrors = validationResult(req)

    return {
      data: matchedData(req),
      errors: validationErrors.isEmpty() ? null : validationErrorsToArray()
    }

    function validationErrorsToArray () {
      const map = validationErrors.mapped()
      return Object.keys(map).map(key => map[key].msg)
    }
  }
}
