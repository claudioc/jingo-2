import { Config } from '@lib/config';
import { validateCreate } from '@lib/validators/doc';
import authMiddleware from '@middlewares/auth';
import csrfMiddleware from '@middlewares/csrf';
import gitRequiredMiddleware from '@middlewares/git-required';
import BaseRoute from '@routes/route';
import { Request, Response, Router } from 'express';

import { get as get_docCompare } from './compare';
import { get as get_docCreate, post as post_docCreate } from './create';
import { get as get_docDelete, post as post_docDelete } from './delete';
import { get as get_docHistory } from './history';
import { get as get_docRecent } from './recent';
import { get as get_docRestore, post as post_docRestore } from './restore';
import { get as get_docUpdate, post as post_docUpdate } from './update';

export default class DocRoute extends BaseRoute {
  public static install(router: Router, config: Config) {
    const csrfProtection = csrfMiddleware(config);
    const gitRequired = gitRequiredMiddleware(config);
    const auth = authMiddleware(config);

    const route = new DocRoute(config);

    router.get('/doc/create', [auth('createDocuments'), csrfProtection], get_docCreate(route));
    router.post(
      '/doc/create',
      [auth('createDocuments'), csrfProtection, validateCreate()],
      post_docCreate(route)
    );

    router.get('/doc/update', [auth('editDocuments'), csrfProtection], get_docUpdate(route));
    router.post(
      '/doc/update',
      [auth('editDocuments'), csrfProtection, validateCreate()],
      post_docUpdate(route)
    );

    router.get('/doc/delete', [auth('deleteDocuments'), csrfProtection], get_docDelete(route));
    router.post('/doc/delete', [auth('deleteDocuments'), csrfProtection], post_docDelete(route));

    router.get('/doc/history', gitRequired, get_docHistory(route));

    router.get(
      '/doc/restore',
      [auth('editDocuments'), gitRequired, csrfProtection],
      get_docRestore(route)
    );
    router.post(
      '/doc/restore',
      [auth('editDocuments'), gitRequired, csrfProtection],
      post_docRestore(route)
    );

    router.get('/doc/recent', [gitRequired], get_docRecent(route));

    router.get('/doc/compare', [gitRequired], get_docCompare(route));
  }

  public async assertDirectoryExists(directory, req: Request, res: Response): Promise<boolean> {
    if (!directory) {
      return true;
    }

    const { folderName, parentDirname } = this.folderHelpers.splitPath(directory);
    const itExists = await this.sdk.folderExists(folderName, parentDirname);
    if (!itExists) {
      if (!req.app.get('requiresJson')) {
        this.renderTemplate(res, `${__dirname}/fail`, {
          directory,
          folderName,
          parentDirname
        });
      }
    }

    return itExists;
  }

  public async assertDocDoesNotExist(docName, into, req: Request, res: Response) {
    if (!docName) {
      return true;
    }

    const itExists = await this.sdk.docExists(docName, into);
    if (itExists) {
      if (!req.app.get('requiresJson')) {
        res.redirect(this.wikiHelpers.pathFor(docName));
      }
    }

    return !itExists;
  }

  public async assertDocExists(docName, into, req: Request, res: Response) {
    const itExists = await this.sdk.docExists(docName, into);
    if (!itExists) {
      if (!req.app.get('requiresJson')) {
        res.redirect(this.config.mount('/?e=1'));
      }
    }

    return itExists;
  }
}
