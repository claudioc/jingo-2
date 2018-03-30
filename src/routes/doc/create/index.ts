import { je } from '@events/index'
import { RouteEntry, RouteHandler } from '@routes/route'
import { assign as _assign } from 'lodash'
import DocRoute from '..'

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return create.apply(route, [req, res, next])
  }
}

export const post: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return didCreate.apply(route, [req, res, next])
  }
}

const create: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Creating a document'
  const docName = req.query.docName || ''
  const into = req.query.into || ''
  const csrfToken = (req as any).csrfToken()

  if (!await this.assertDirectoryExists(into, req, res)) {
    return
  }

  if (!await this.assertDocDoesNotExist(docName, into, req, res)) {
    return
  }

  const wikiIndex = this.config.get('wiki.index')
  const docTitle = this.wikiHelpers.unwikify(docName) || ''
  const scope: object = {
    csrfToken,
    docTitle,
    into,
    wikiIndex
  }

  this.renderTemplate(res, __dirname, scope)
}

const didCreate: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Creating a document'
  const { errors, data } = this.inspectRequest(req)
  const into = data.into || ''
  const csrfToken = (req as any).csrfToken()

  const scope: object = {
    content: data.content,
    csrfToken,
    docTitle: data.docTitle,
    into
  }

  if (errors) {
    this.renderTemplate(res, __dirname, _assign(scope, { errors }))
    return
  }

  if (!await this.assertDirectoryExists(into, req, res)) {
    return
  }

  const docName = this.wikiHelpers.wikify(data.docTitle)

  const itExists = await this.sdk.docExists(docName, into)
  if (itExists) {
    this.renderTemplate(
      res,
      __dirname,
      _assign(scope, {
        errors: ['A document with this title already exists']
      })
    )
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
