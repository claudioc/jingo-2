import { je } from '@events/index'
import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    del.apply(route, [req, res, next])
  }
}

export const post = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    didDelete.apply(route, [req, res, next])
  }
}

const del = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Deleting a document'
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

  const docTitle = this.wikiHelpers.unwikify(docName)

  const scope: object = {
    csrfToken,
    docName,
    docTitle,
    into
  }

  this.render(req, res, 'doc-delete', scope)
}

const didDelete = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Deleting a document'
  const docName = req.body.docName
  const into = req.body.into

  if (!await this.assertDirectoryExists(into, req, res)) {
    return
  }

  const itExists = await this.sdk.docExists(docName, into)
  if (!itExists) {
    res.redirect(this.config.mount(`/?e=1`))
    return
  }

  await this.sdk.deleteDoc(docName, into)

  res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0')

  req.app &&
    req.app.emit(je('jingo.docDeleted'), {
      docName,
      into
    })
}
