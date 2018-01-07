import { je } from '@events/index'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { NextFunction, Request, Response, Router } from 'express'

export default class WikiRoute extends BaseRoute {
  dirName: string
  docName: string

  constructor (config, reqPath) {
    super(config)

    const { dirName, docName } = this.docHelpers.splitPath(reqPath)
    this.dirName = dirName
    this.docName = docName
  }

  public static create (router: Router, config: Config) {
    const basePath = config.get('wiki.basePath')
    const mountPath = config.get('mountPath')

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
        res.redirect(`${mountPath}${basePath}/`)
        return
      }

      const method = reqPath.endsWith('/') ? 'list' : 'read';
      (new WikiRoute(config, reqPath))[method](req, res, next)
    })
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    const isIndex = this.config.get('wiki.index') === this.docName
    try {
      const doc = await this.sdk.loadDoc(this.docName, this.dirName)
      const scope: object = {
        codeHighlighterTheme: this.config.get('features.codeHighlighter.theme'),
        content: this.sdk.renderToHtml(doc.content),
        dirName: this.dirName,
        docName: this.docName,
        docTitle: isIndex ? '' : doc.title
      }
      this.title = `Jingo – ${doc.title}`
      this.render(req, res, 'wiki-read', scope)
      req.app && req.app.emit(je('jingo.wikiRead'), this.docName)
    } catch (e) {
      if (isIndex) {
        res.redirect(`${this.config.get('mountPath')}?welcome`)
      } else {
        const createPageUrl = this.docHelpers.pathFor('create', this.docName, this.dirName)
        res.redirect(createPageUrl)
      }
    }
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    const { folderName, parentDirname } = this.folderHelpers.splitPath(this.dirName)

    this.title = `Jingo – List of documents`

    let docList
    let folderList
    try {
      docList = await this.sdk.listDocs(this.dirName)
      folderList = await this.sdk.listFolders(this.dirName)
    } catch (err) {
      res.status(404).render('404')
      return
    }

    const scope = {
      dirName: this.dirName,
      docList,
      folderList,
      folderName,
      parentDirname
    }

    this.render(req, res, 'wiki-list', scope)
    req.app && req.app.emit(je('jingo.wikiList'), this.dirName)
  }
}
