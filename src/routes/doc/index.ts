import api from '@api'
import { Config } from '@lib/config'
import { docPathFor } from '@lib/doc'
import { unwikify, wikify, wikiPathFor } from '@lib/wiki'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import { matchedData, sanitize } from 'express-validator/filter'
import { assign as _assign } from 'lodash'

// Returns a validator chains for the new document
function validatesCreate () {
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
  public static create (router: Router, config: Config) {
    router.get('/doc/new/:docName?', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).newDoc(req, res, next)
    })

    router.post('/doc/create', validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).createDoc(req, res, next)
    })

    router.get('/doc/edit/:docName', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).editDoc(req, res, next)
    })

    router.post('/doc/update', validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).updateDoc(req, res, next)
    })
  }

  public async newDoc (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docName = req.params.docName || ''

    // If a document with this name already exists, bring the user there
    if (docName) {
      const itExists = await api(this.config).docExists(docName)
      if (itExists) {
        res.redirect(wikiPathFor(docName))
        return
      }
    }

    const docTitle = unwikify(docName) || 'Unnamed document'

    const scope: object = {
      docTitle
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

    // @FIXME check if the file already exists (and fail)
    await api(this.config).saveDoc(wikify(data.docTitle), data.content)

    // All done, go to the just saved page
    res.redirect(wikiPathFor(data.docTitle))
  }

  public async editDoc (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Editing a document'
    const docName = req.params.docName

    const itExists = await api(this.config).docExists(docName)
    if (!itExists) {
      res.redirect(docPathFor(docName, 'new'))
      return
    }

    const doc = await api(this.config).loadDoc(docName)

    const docTitle = unwikify(docName)

    const scope: object = {
      content: doc.content,
      docName,
      docTitle
    }

    this.render(req, res, 'doc-edit', scope)
  }

  public async updateDoc (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)

    const oldDocName = req.body.docName

    const scope: object = {
      content: data.content,
      docName: oldDocName,
      docTitle: data.docTitle
    }

    if (errors) {
      this.render(req, res, 'doc-edit', _assign(scope, { errors }))
      return
    }

    const newDocName = wikify(data.docTitle)

    // Rename the file (if needed and if possible)
    if (!(await api(this.config).renameDoc(oldDocName, newDocName))) {
      this.render(req, res, 'doc-edit', _assign(scope, { errors: ['Cannot rename a document to an already existant one'] }))
      return
    }

    await api(this.config).saveDoc(newDocName, data.content)

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
