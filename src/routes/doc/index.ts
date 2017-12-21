import api from '@api'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { check } from 'express-validator/check'
import { sanitize } from 'express-validator/filter'
import { assign as _assign } from 'lodash'

// Returns a validator chains for the new document
const validatesCreate = () => {
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
    router.get('/doc/create/:docName?', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).create(req, res, next)
    })

    router.post('/doc/create', validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didCreate(req, res, next)
    })

    router.get('/doc/update/:docName', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).update(req, res, next)
    })

    router.post('/doc/update', validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didUpdate(req, res, next)
    })

    router.get('/doc/delete/:docName', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).delete(req, res, next)
    })

    router.post('/doc/delete', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didDelete(req, res, next)
    })
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docName = req.params.docName || ''

    // If a document with this name already exists, bring the user there
    if (docName) {
      const itExists = await api(this.config).docExists(docName)
      if (itExists) {
        res.redirect(this.wikiHelpers.wikiPathFor(docName))
        return
      }
    }

    const wikiIndex = this.config.get('wiki.index')
    const docTitle = this.wikiHelpers.unwikify(docName) || 'Unnamed document'
    const scope: object = {
      docTitle,
      wikiIndex
    }

    this.render(req, res, 'doc-create', scope)
  }

  public async didCreate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)

    const scope: object = {
      content: data.content,
      docTitle: data.docTitle
    }

    if (errors) {
      this.render(req, res, 'doc-create', _assign(scope, { errors }))
      return
    }

    const docName = this.wikiHelpers.wikify(data.docTitle)

    const itExists = await api(this.config).docExists(docName)
    if (itExists) {
      this.render(req, res, 'doc-create', _assign(scope, { errors: ['A document with this title already exists'] }))
      return
    }

    await api(this.config).createDoc(docName, data.content)

    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.wikiPathFor(data.docTitle))
  }

  public async update (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Editing a document'
    const docName = req.params.docName

    const itExists = await api(this.config).docExists(docName)
    if (!itExists) {
      res.redirect(this.docHelpers.docPathFor(docName, 'create'))
      return
    }

    const doc = await api(this.config).loadDoc(docName)
    const wikiIndex = this.config.get('wiki.index')

    const docTitle = this.wikiHelpers.unwikify(docName)

    const scope: object = {
      content: doc.content,
      docName,
      docTitle,
      wikiIndex
    }

    this.render(req, res, 'doc-update', scope)
  }

  public async didUpdate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const oldDocName = req.body.docName

    const scope: object = {
      content: data.content,
      docName: oldDocName,
      docTitle: data.docTitle
    }

    if (errors) {
      this.render(req, res, 'doc-update', _assign(scope, { errors }))
      return
    }

    const newDocName = this.wikiHelpers.wikify(data.docTitle)

    try {
      await api(this.config).updateDoc(newDocName, oldDocName, data.content)
    } catch (err) {
      this.render(req, res, 'doc-update', _assign(scope, { errors: [err.message] }))
      return
    }

    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.wikiPathFor(data.docTitle))
  }

  public async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Deleting a document'
    const docName = req.params.docName

    const itExists = await api(this.config).docExists(docName)
    if (!itExists) {
      res.redirect('/?e=1')
      return
    }

    const docTitle = this.wikiHelpers.unwikify(docName)

    const scope: object = {
      docName,
      docTitle
    }

    this.render(req, res, 'doc-delete', scope)
  }

  public async didDelete (req: Request, res: Response, next: NextFunction): Promise<void> {
    const docName = req.body.docName

    const itExists = await api(this.config).docExists(docName)
    if (!itExists) {
      res.redirect('/?e=1')
      return
    }

    await api(this.config).deleteDoc(docName)

    res.redirect('/?e=0')
  }
}
