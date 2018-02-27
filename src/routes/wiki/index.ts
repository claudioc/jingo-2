import { je } from '@events/index'
import { Config } from '@lib/config'
import BaseRoute from '@routes/route'
import { IDoc } from '@sdk'
import { NextFunction, Request, Response, Router } from 'express'

export default class WikiRoute extends BaseRoute {
  public static create(router: Router, config: Config) {
    const basePath = config.get('wiki.basePath')

    /**
     * The catch-all route for all the route requests:
     * - /wiki/:docname: will render `docname`
     * - /wiki/:dir/: will render the list in `dir`
     * - /wiki/:dir/:docname – will render docname in `dir`
     * Optionally also receives the version of the document as
     * a query parameter `v` with a value of a git commit
     */
    router.get(`/${basePath}*`, (req: Request, res: Response, next: NextFunction) => {
      const reqPath = req.params[0]
      delete req.params[0]

      if (reqPath.length === 0) {
        res.redirect(config.mount(`${basePath}/`))
        return
      }

      const method = reqPath.endsWith('/') ? 'list' : 'read'
      new WikiRoute(config, reqPath)[method](req, res, next)
    })
  }

  private dirName: string
  private docName: string

  constructor(config, reqPath) {
    super(config)
    const { dirName, docName } = this.docHelpers.splitPath(reqPath)
    this.dirName = dirName
    this.docName = docName
  }

  public async read(req: Request, res: Response, next: NextFunction) {
    const isIndex = this.config.get('wiki.index') === this.docName
    try {
      const doc = await this.acquireDoc(req)
      const scope: object = {
        codeHighlighterTheme: this.config.get('features.codeHighlighter.theme'),
        content: doc.content,
        dirName: this.dirName,
        docName: this.docName,
        docTitle: doc.title,
        docVersion: doc.version,
        isIndex
      }
      this.title = `Jingo – ${doc.title}`
      this.render(req, res, 'wiki-read', scope)
      req.app && req.app.emit(je('jingo.wikiRead'), this.docName)
    } catch (e) {
      if (isIndex) {
        res.redirect(this.config.mount(`/?welcome`))
      } else {
        const createPageUrl = this.docHelpers.pathFor('create', this.docName, this.dirName)
        res.status(404)
        this.render(req, res, 'wiki-fail', {
          createPageUrl
        })
      }
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    const { folderName, parentDirname } = this.folderHelpers.splitPath(this.dirName)

    this.title = `Jingo – List of documents`

    let docList
    let folderList
    try {
      docList = await this.sdk.listDocs(this.dirName)
      folderList = await this.sdk.listFolders(this.dirName)
    } catch (err) {
      res.status(404)
      this.render(req, res, 'wiki-list-fail', {
        directory: this.dirName,
        folderName,
        parentDirname
      })

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

  /**
   * Acquires the doc from cache or from the actual doc content
   * @param req The request object
   */
  private async acquireDoc(req: Request): Promise<IDoc> {
    const cache = req.app.get('cache')
    const version = this.readVersion(req)

    let doc
    if (!cache || version !== 'HEAD') {
      doc = await this.sdk.loadDoc(this.docName, this.dirName, version)
      doc.content = this.sdk.renderToHtml(doc.content)
      doc.version = version
      return doc
    }

    doc = cache.get(this.dirName + this.docName)
    if (!doc) {
      doc = await this.sdk.loadDoc(this.docName, this.dirName)
      // Save in the cache the compiled doc content
      doc.content = this.sdk.renderToHtml(doc.content)
      doc.version = version
      cache.put(this.dirName + this.docName, doc, 3600 * 1000)
    }

    return doc
  }

  private readVersion(req: Request): string {
    if (!this.config.hasFeature('gitSupport')) {
      return 'HEAD'
    }

    return (req.query.v || 'HEAD').trim()
  }
}
