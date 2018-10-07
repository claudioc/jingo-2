import { je } from '@events/index';
import { Config } from '@lib/config';
import doc, { Doc } from '@lib/doc';
import inspectRequest from '@lib/inspect-request';
import { validateCreate } from '@lib/validators/doc';
import wiki, { Wiki } from '@lib/wiki';
import sdk, { Sdk } from '@sdk';
import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';
import * as send from 'send';

export default class ApiRoute {
  public static install(router: Router, config: Config) {
    const route = new ApiRoute(config);
    /**
     * Renders a markdown string to html
     */
    router.post(`/api/render`, (req: Request, res: Response, next: NextFunction) =>
      route.renderMarkdown(req, res, next)
    );

    /**
     * Serves static content directly from the repository
     */
    router.get(`/api/serve-static/*`, (req: Request, res: Response, next: NextFunction) =>
      route.serveStatic(req, res, next)
    );

    /**
     * Serves the rendered content of a page
     */
    router.get(`/api/wiki/*`, (req: Request, res: Response, next: NextFunction) =>
      route.wikiRender(req, res, next)
    );

    /**
     * Creates a new document
     */
    router.post(`/api/doc`, validateCreate(), (req: Request, res: Response, next: NextFunction) =>
      route.docCreate(req, res, next)
    );
  }

  public docHelpers: Doc;
  public wikiHelpers: Wiki;
  private sdk: Sdk;

  constructor(public config: Config) {
    this.sdk = sdk(this.config);
    this.docHelpers = doc(this.config);
    this.wikiHelpers = wiki(this.config);
  }

  public async wikiRender(req: Request, res: Response, next: NextFunction) {
    const reqPath = req.params[0];
    const { dirName, docName } = this.docHelpers.splitPath(reqPath);

    try {
      const document = await this.sdk.loadDoc(docName, dirName);
      res.send(this.sdk.renderToHtml(document.content));
      req.app && req.app.emit(je('jingo.wikiRead'));
    } catch (e) {
      res.boom.notFound('Not found');
    }
  }

  public async renderMarkdown(req: Request, res: Response, next: NextFunction) {
    const renderedContent = this.sdk.renderToHtml(req.body.content);
    res.send(renderedContent);
  }

  public async serveStatic(req: Request, res: Response, next: NextFunction) {
    const assetName = req.params[0] || '';

    if (assetName === '' || (!assetName.endsWith('.js') && !assetName.endsWith('.css'))) {
      return res.boom.notFound('Not found');
    }

    const sendOpts = {
      index: false,
      root: this.config.get('documentRoot')
    };

    send(req, assetName, sendOpts).pipe(res);
  }

  public async docCreate(req: Request, res: Response, next: NextFunction) {
    const { errors, data } = this.inspectRequest(req);
    const into = data.into || '';

    if (errors) {
      return res.boom.notAcceptable('Invalid or missing data supplied');
    }

    if (into) {
      const isValidDir = await this.sdk.isDirectoryAccessible(into);
      if (!isValidDir) {
        return res.boom.badData('The provided directory does not exist');
      }
    }

    const docName = this.wikiHelpers.wikify(data.docTitle);

    const itExists = await this.sdk.docExists(docName, into);
    if (itExists) {
      return res.boom.conflict('A document with this title already exists');
    }

    try {
      await this.sdk.createDoc(docName, data.content, into);
    } catch (__) {
      return res.boom.serverUnavailable(`An error occurred while creating ${docName}`);
    }

    req.app && req.app.emit(je('jingo.docCreated'));

    return res.status(201).send(path.join(into, docName));
  }

  protected inspectRequest(req: Request) {
    return inspectRequest(req);
  }
}
