import { RouteEntry, RouteHandler } from '@routes/route'
import DocRoute from '..'

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return history.apply(route, [req, res, next])
  }
}

const history: RouteHandler = async function(this: DocRoute, req, res, next) {
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

  this.renderTemplate(res, __dirname, scope)
}
