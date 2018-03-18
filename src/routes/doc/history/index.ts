import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    history.apply(route, [req, res, next])
  }
}

const history = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – History of the document'
  const docName = req.query.docName || ''
  const into = req.query.into || ''

  if (docName === '') {
    return res.status(400).render('400')
  }

  if (!await this.assertDocExists(docName, into, req, res)) {
    return
  }

  const docTitle = this.wikiHelpers.unwikify(docName)
  const items = await this.git.$history(docName, into)
  const scope: object = {
    docName,
    docTitle,
    history: items.all,
    into
  }

  this.render(req, res, 'doc-history', scope)
}
