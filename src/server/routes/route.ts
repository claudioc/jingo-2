import { Config, TFeaturesSettings } from '@lib/config';
import doc, { Doc } from '@lib/doc';
import folder, { Folder } from '@lib/folder';
import git, { IGitOps } from '@lib/git';
import inspectRequest from '@lib/inspect-request';
import wiki, { Wiki } from '@lib/wiki';
import sdk, { Sdk } from '@sdk';
import { NextFunction, Request, Response } from 'express';

export type RouteHandler = (
  this: BaseRoute,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type RouteEntry = (route: BaseRoute) => RouteHandler;

export default class BaseRoute {
  public wikiHelpers: Wiki;
  public docHelpers: Doc;
  public folderHelpers: Folder;
  public sdk: Sdk;
  public git: IGitOps;
  public features: TFeaturesSettings[];

  constructor(public config: Config, public title: string = 'Jingo') {
    this.wikiHelpers = wiki(this.config);
    this.docHelpers = doc(this.config);
    this.folderHelpers = folder(this.config);
    this.sdk = sdk(this.config);
    this.git = git(this.config);
  }

  public render(res: Response, view: string, options?: object) {
    res.locals.title = this.title;
    res.render(view, options);
  }

  public renderTemplate(res: Response, path: string, options?: object) {
    this.render(res, `${path}/template`, options);
  }

  public async renderTemplateToString(res: Response, path: string, options?: object) {
    return new Promise((resolve, reject) => {
      res.render(`${path}/template`, options, (err, html) => {
        err ? reject(err) : resolve(html);
      });
    });
  }

  public inspectRequest(req: Request) {
    return inspectRequest(req);
  }
}
