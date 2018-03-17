import { je } from '@events/index'
import { NextFunction, Request, Response } from 'express'
import { assign as _assign } from 'lodash'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    update.apply(route, [req, res, next])
  }
}

export const post = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    didUpdate.apply(route, [req, res, next])
  }
}

const update = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Editing a document'
  const docName = req.query.docName || ''
  const into = req.query.into || ''
  const csrfToken = (req as any).csrfToken()

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
    csrfToken,
    docName,
    docTitle,
    into,
    wikiIndex
  }

  this.render(req, res, 'doc-update', scope)
}

const didUpdate = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Editing a document'
  const { errors, data } = this.inspectRequest(req)
  const oldDocName = req.body.docName
  const comment = req.body.comment
  const into = data.into
  const csrfToken = (req as any).csrfToken()

  const scope: object = {
    comment,
    content: data.content,
    csrfToken,
    docName: oldDocName,
    docTitle: data.docTitle,
    into
  }

  if (errors) {
    this.render(req, res, 'doc-update', _assign(scope, { errors }))
    return
  }

  if (!await this.assertDirectoryExists(into, req, res)) {
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

  req.app &&
    req.app.emit(je('jingo.docUpdated'), {
      comment,
      docName: oldDocName,
      into
    })
}
