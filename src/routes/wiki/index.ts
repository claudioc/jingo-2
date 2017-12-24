import api from '@api'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'
import * as MarkdownIt from 'markdown-it'

export default class WikiRoute extends BaseRoute {
  parser: MarkdownIt.MarkdownIt
  dirName: string
  docName: string

  constructor (config, reqPath) {
    super(config)

    const { dirName, docName } = this.docHelpers.parsePath(reqPath)
    this.dirName = dirName
    this.docName = docName

    this.parser = new MarkdownIt()
  }

  public static create (router: Router, config: Config) {
    const basePath = config.get('wiki.basePath')

    /**
     * The catch-all route for all the route request:
     * - /wiki/docname: will render `docname`
     * - /wiki/dir/: will render the list in `dir`
     * - /wiki/dir/docname: will render docname in `dir`
     */
    router.get(`/${basePath}*`, (req: Request, res: Response, next: NextFunction) => {
      const reqPath = req.params[0]
      delete req.params[0]

      if (reqPath.length === 0) {
        res.redirect(`/${basePath}/`)
        return
      }

      const method = reqPath.endsWith('/') ? 'list' : 'read';
      (new WikiRoute(config, reqPath))[method](req, res, next)
    })
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    const docTitle = this.wikiHelpers.unwikify(this.docName)
    const isIndex = this.config.get('wiki.index') === this.docName

    this.title = `Jingo – ${docTitle}`

    try {
      const doc = await api(this.config).loadDoc(this.docName, this.dirName)
      const scope: object = {
        content: this.parser.render(doc.content),
        dirName: this.dirName,
        docName: this.docName,
        docTitle: isIndex ? '' : docTitle
      }
      this.render(req, res, 'wiki-read', scope)
    } catch (e) {
      if (isIndex) {
        res.redirect('/?welcome')
      } else {
        const createPageUrl = this.docHelpers.pathFor('create', docTitle)
        res.redirect(createPageUrl)
      }
    }
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    const apiMethods = api(this.config)
    const dirParts = this.folderHelpers.parsePath(this.dirName)

    this.title = `Jingo – List of documents`

    let docList
    let folderList
    try {
      docList = await apiMethods.listDocs(this.dirName)
      folderList = await apiMethods.listFolders(this.dirName)
    } catch (err) {
      res.status(404).render('404')
      return
    }

    const scope = {
      dirName: this.dirName,
      docList,
      folderList,
      folderName: dirParts.folderName,
      parentDirName: dirParts.parentDirName
  }

    this.render(req, res, 'wiki-list', scope)
  }
}
