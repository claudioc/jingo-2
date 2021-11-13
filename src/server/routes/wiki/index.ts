import { je } from '@events/index';
import { Config } from '@lib/config';
import BaseRoute from '@routes/route';
import { IDoc } from '@sdk';
import { NextFunction, Request, Response, Router } from 'express';

export default class WikiRoute extends BaseRoute {
  public static install(router: Router, config: Config) {
    const basePath = config.get('wiki.basePath');

    /**
     * The catch-all route for all the route requests:
     * - /wiki/:docname: will render `docname`
     * - /wiki/:dir/: will render the list in `dir`
     * - /wiki/:dir/:docname – will render docname in `dir`
     * Optionally also receives the version of the document as
     * a query parameter `v` with a value of a git commit
     */
    router.get(`/${basePath}*`, (req: Request, res: Response, next: NextFunction) => {
      const reqPath = req.params[0];
      delete req.params[0];

      if (reqPath.length === 0) {
        res.redirect(config.mount(`${basePath}/`));
        return;
      }

      const method = reqPath.endsWith('/') ? 'list' : 'read';
      new WikiRoute(config, reqPath)[method](req, res, next);
    });
  }

  private dirName: string;
  private docName: string;

  constructor(config, reqPath) {
    super(config);
    const { dirName, docName } = this.docHelpers.splitPath(reqPath);
    this.dirName = dirName;
    this.docName = docName;
  }

  public async read(req: Request, res: Response, next: NextFunction) {
    const isIndex = this.config.get('wiki.index') === this.docName;
    try {
      const doc = await this.acquireDoc(req);
      const scope: object = {
        codeHighlighterTheme: this.config.get('features.codeHighlighter.theme'),
        content: doc.content,
        html: doc.html,
        dirName: this.dirName,
        docName: this.docName,
        docTitle: doc.title,
        docVersion: doc.version,
        isIndex
      };
      this.title = `Jingo – ${doc.title}`;
      if (req.app.get('requiresJson')) {
        res.json(scope);
      } else {
        this.renderTemplate(res, `${__dirname}/read`, scope);
      }
      req.app && req.app.emit(je('jingo.wikiRead'), this.docName);
    } catch (e) {
      if (isIndex) {
        if (req.app.get('requiresJson')) {
          res.status(404);
          res.json({});
        } else {
          res.redirect(this.config.mount(`/?welcome`));
        }
      } else {
        res.status(404);
        if (req.app.get('requiresJson')) {
          res.json({
            docName: this.docName,
            docTitle: this.wikiHelpers.unwikify(this.docName),
            wikiPath: this.wikiHelpers.pathFor(this.docName, this.dirName),
            into: this.dirName
          });
        } else {
          const createPageUrl = this.docHelpers.pathFor('create', this.docName, this.dirName);
          this.renderTemplate(res, `${__dirname}/fail`, {
            createPageUrl
          });
        }
      }
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    const { folderName, parentDirname } = this.folderHelpers.splitPath(this.dirName);

    this.title = `Jingo – List of documents`;

    let docList;
    let folderList;
    try {
      docList = await this.sdk.listDocs(this.dirName);
      folderList = await this.sdk.listFolders(this.dirName);
    } catch (err) {
      res.status(404);
      if (req.app.get('requiresJson')) {
        res.json({});
      } else {
        this.renderTemplate(res, `${__dirname}/list-fail`, {
          directory: this.dirName,
          folderName,
          parentDirname
        });
      }

      return;
    }

    const scope = {
      dirName: this.dirName,
      docList,
      folderList,
      folderName,
      parentDirname
    };

    if (req.app.get('requiresJson')) {
      res.json(scope);
    } else {
      this.renderTemplate(res, `${__dirname}/list`, scope);
    }

    req.app && req.app.emit(je('jingo.wikiList'), this.dirName);
  }

  /**
   * Acquires the doc from cache or from the actual doc content
   * @param req The request object
   */
  private async acquireDoc(req: Request): Promise<IDoc> {
    const cache = req.app.get('cache');
    const version = this.readVersion(req);

    let doc: IDoc;
    if (!cache || version !== 'HEAD') {
      doc = await this.sdk.loadDoc(this.docName, this.dirName, version);
      doc.html = this.sdk.renderToHtml(doc.content);
      doc.version = version;
      return doc;
    }

    doc = cache.get(this.dirName + this.docName);
    if (!doc) {
      doc = await this.sdk.loadDoc(this.docName, this.dirName);
      // Save in the cache the compiled doc content
      doc.html = this.sdk.renderToHtml(doc.content);
      doc.version = version;
      cache.put(this.dirName + this.docName, doc, 3600 * 1000);
    }

    return doc;
  }

  private readVersion(req: Request): string {
    if (!this.config.hasFeature('gitSupport')) {
      return 'HEAD';
    }

    return ((req.query.v as string) || 'HEAD').trim();
  }
}
