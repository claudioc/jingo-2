import { je } from '@events/index'
import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    restore.apply(route, [req, res, next])
  }
}

export const post = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    didRestore.apply(route, [req, res, next])
  }
}

const restore = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Restore a previous version'
  const docName = req.query.docName || ''
  const into = req.query.into || ''
  const version = req.query.v || ''
  const csrfToken = (req as any).csrfToken()

  if (docName === '' || version === '') {
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
    into,
    version
  }

  this.render(req, res, 'doc-restore', scope)
}

const didRestore = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Restoring a document'
  const docName = req.body.docName
  const into = req.body.into
  const version = req.body.v || 'HEAD'

  if (version !== 'HEAD') {
    try {
      await this.git.$restore(docName, into, version)
    } catch (err) {
      res.status(500).render('500', { err })
      return
    }

    const cache = req.app.get('cache')
    if (cache) {
      cache.del(into + docName)
    }

    req.app &&
      req.app.emit(je('jingo.docRestored'), {
        docName,
        into,
        version
      })
  }

  const docTitle = this.wikiHelpers.unwikify(docName)
  res.redirect(this.wikiHelpers.pathFor(docTitle, into))
}
