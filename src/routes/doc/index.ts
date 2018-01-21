import { je } from '@events/index'
import { Config } from '@lib/config'
import { validateCreate } from '@lib/validators/doc'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import { assign as _assign } from 'lodash'

export default class DocRoute extends BaseRoute {
  public static create (router: Router, config: Config) {
    router.get(`/doc/create`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).create(req, res, next)
    })

    router.post(`/doc/create`, validateCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didCreate(req, res, next)
    })

    router.get(`/doc/update`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).update(req, res, next)
    })

    router.post(`/doc/update`, validateCreate(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didUpdate(req, res, next)
    })

    router.get(`/doc/delete`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).delete(req, res, next)
    })

    router.post(`/doc/delete`, (req: Request, res: Response, next: NextFunction) => {
      new DocRoute(config).didDelete(req, res, next)
    })
  }

  public async create (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Creating a document'

    const docName = req.query.docName || ''
    const into = req.query.into || ''

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!await this.assertDocDoesNotExist(docName, into, req, res)) {
      return
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
    this.title = 'Jingo – Creating a document'
    const { errors, data } = this.inspectRequest(req)
    const into = data.into || ''

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

    const itExists = await this.sdk.docExists(docName, into)
    if (itExists) {
      this.render(req, res, 'doc-create', _assign(scope, { errors: ['A document with this title already exists'] }))
      return
    }

    await this.sdk.createDoc(docName, data.content, into)

    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into))
    req.app.emit(je('jingo.docCreated'), {
      docName,
      into
    })
  }

  public async update (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Editing a document'
    const docName = req.query.docName || ''
    const into = req.query.into || ''

    if (docName === '') {
      return res.status(400).render('400')
    }

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!await this.assertDocExists(docName, into, req, res)) {
      return
    }

    const doc = await this.sdk.loadDoc(docName, into)
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
    const comment = req.body.comment
    const into = data.into

    const scope: object = {
      comment,
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
      await this.sdk.updateDoc(oldDocName, newDocName, data.content, into)
    } catch (err) {
      this.render(req, res, 'doc-update', _assign(scope, { errors: [err.message] }))
      return
    }

    const cache = req.app.get('cache')
    if (cache) {
      cache.del(into + oldDocName)
    }

    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into))

    req.app && req.app.emit(je('jingo.docUpdated'), {
      comment,
      docName: oldDocName,
      into
    })
  }

  public async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
    this.title = 'Jingo – Deleting a document'
    const docName = req.query.docName
    const into = req.query.into || ''

    if (docName === '') {
      return res.status(400).render('400')
    }

    if (!await this.assertDirectoryExists(into, req, res)) {
      return
    }

    if (!await this.assertDocExists(docName, into, req, res)) {
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

    const itExists = await this.sdk.docExists(docName, into)
    if (!itExists) {
      res.redirect(`${this.config.get('mountPath')}?e=1`)
      return
    }

    await this.sdk.deleteDoc(docName, into)

    res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0')

    req.app && req.app.emit(je('jingo.docDeleted'), {
      docName,
      into
    })
  }

  private async assertDirectoryExists (directory, req: Request, res: Response): Promise<boolean> {
    if (!directory) {
      return true
    }

    const { folderName, parentDirname } = this.folderHelpers.splitPath(directory)
    const itExists = await this.sdk.folderExists(folderName, parentDirname)
    if (!itExists) {
      this.render(req, res, 'doc-fail', {
        directory,
        folderName,
        parentDirname
      })
    }

    return itExists
  }

  private async assertDocDoesNotExist (docName, into, req: Request, res: Response) {
    if (!docName) {
      return true
    }

    const itExists = await this.sdk.docExists(docName, into)
    if (itExists) {
      res.redirect(this.wikiHelpers.pathFor(docName))
    }

    return !itExists
  }

  private async assertDocExists (docName, into, req: Request, res: Response) {
    const itExists = await this.sdk.docExists(docName, into)
    if (!itExists) {
      res.redirect(`${this.config.get('mountPath')}?e=1`)
    }

    return itExists
  }
}
