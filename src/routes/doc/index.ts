import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import sdk from '@sdk'
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

    check('into')
      .trim(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim(),

    sanitize(['docTitle', 'content', 'into'])
  ]
}

export default class DocRoute extends BaseRoute {
  public static create (router: Router, config: Config) {
    const proxyPath = config.get('proxyPath')
    router.get(`${proxyPath}doc/create`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).create(req, res, next)
    })

    router.post(`${proxyPath}doc/create`, validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didCreate(req, res, next)
    })

    router.get(`${proxyPath}doc/update`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).update(req, res, next)
    })

    router.post(`${proxyPath}doc/update`, validatesCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didUpdate(req, res, next)
    })

    router.get(`${proxyPath}doc/delete`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).delete(req, res, next)
    })

    router.post(`${proxyPath}doc/delete`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didDelete(req, res, next)
    })
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a document'

    // The document name can be part of the URL or not
    const docName = req.query.docName || ''
    const into = req.query.into || ''

    // If a document with this name already exists, bring the user there
    if (docName) {
      const itExists = await sdk(this.config).docExists(docName, into)
      if (itExists) {
        res.redirect(this.wikiHelpers.pathFor(docName))
        return
      }
    }

    const wikiIndex = this.config.get('wiki.index')
    const docTitle = this.wikiHelpers.unwikify(docName) || ''
    const scope: object = {
      docTitle,
      into,
      wikiIndex
    }

    this.render(req, res, 'doc-create', scope)
  }

  public async didCreate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const into = data.into

    const scope: object = {
      content: data.content,
      docTitle: data.docTitle,
      into
    }

    if (errors) {
      this.render(req, res, 'doc-create', _assign(scope, { errors }))
      return
    }

    const docName = this.wikiHelpers.wikify(data.docTitle)

    const itExists = await sdk(this.config).docExists(docName, into)
    if (itExists) {
      this.render(req, res, 'doc-create', _assign(scope, { errors: ['A document with this title already exists'] }))
      return
    }

    await sdk(this.config).createDoc(docName, data.content, into)

    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into))
  }

  public async update (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Editing a document'
    const docName = req.query.docName || ''
    const into = req.query.into || ''

    if (docName === '') {
      return res.status(400).render('400')
    }

    const itExists = await sdk(this.config).docExists(docName, into)
    if (!itExists) {
      res.redirect(this.docHelpers.pathFor('create', docName, into))
      return
    }

    const doc = await sdk(this.config).loadDoc(docName, into)
    const wikiIndex = this.config.get('wiki.index')

    const docTitle = this.wikiHelpers.unwikify(docName)

    const scope: object = {
      content: doc.content,
      docName,
      docTitle,
      into,
      wikiIndex
    }

    this.render(req, res, 'doc-update', scope)
  }

  public async didUpdate (req: Request, res: Response, next: NextFunction): Promise<void> {
    const { errors, data } = this.inspectRequest(req)
    const oldDocName = req.body.docName
    const into = data.into

    const scope: object = {
      content: data.content,
      docName: oldDocName,
      docTitle: data.docTitle,
      into
    }

    if (errors) {
      this.render(req, res, 'doc-update', _assign(scope, { errors }))
      return
    }

    const newDocName = this.wikiHelpers.wikify(data.docTitle)

    try {
      await sdk(this.config).updateDoc(newDocName, oldDocName, data.content, into)
    } catch (err) {
      this.render(req, res, 'doc-update', _assign(scope, { errors: [err.message] }))
      return
    }

    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into))
  }

  public async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Deleting a document'
    const docName = req.query.docName
    const into = req.query.into || ''

    if (docName === '') {
      return res.status(400).render('400')
    }

    const itExists = await sdk(this.config).docExists(docName, into)
    if (!itExists) {
      res.redirect(`${this.config.get('proxyPath')}?e=1`)
      return
    }

    const docTitle = this.wikiHelpers.unwikify(docName)

    const scope: object = {
      docName,
      docTitle,
      into
    }

    this.render(req, res, 'doc-delete', scope)
  }

  public async didDelete (req: Request, res: Response, next: NextFunction): Promise<void> {
    const docName = req.body.docName
    const into = req.body.into

    const itExists = await sdk(this.config).docExists(docName, into)
    if (!itExists) {
      res.redirect(`${this.config.get('proxyPath')}?e=1`)
      return
    }

    await sdk(this.config).deleteDoc(docName, into)

    res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0')
  }
}
