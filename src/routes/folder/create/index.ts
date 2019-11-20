import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import { assign as _assign } from 'lodash';
import FolderRoute from '..';

export const get: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return create.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return didCreate.apply(route, [req, res, next]);
  };
};

const create: RouteHandler = async function (this: FolderRoute, req, res, next) {
  this.title = 'Jingo – Creating a folder';
  const into = req.query.into || '';
  const folderName = req.query.folderName || '';
  const csrfToken = (req as any).csrfToken();

  if (!await this.assertDirectoryExists(into, req, res)) {
    return;
  }

  if (!await this.assertFolderDoesNotExist(folderName, into, req, res)) {
    return;
  }

  const scope = {
    csrfToken,
    folderName,
    into
  };

  this.renderTemplate(res, __dirname, scope);
};

const didCreate: RouteHandler = async function (this: FolderRoute, req, res, next) {
  const { errors, data } = this.inspectRequest(req);
  const folderName = data.folderName;
  const into = data.into;
  const csrfToken = (req as any).csrfToken();

  const scope: object = {
    csrfToken,
    folderName,
    into
  };

  if (errors) {
    this.renderTemplate(res, __dirname, _assign(scope, { errors }));
    return;
  }

  const itExists = await this.sdk.folderExists(folderName, into);
  if (itExists) {
    this.renderTemplate(
      res,
      __dirname,
      _assign(scope, { errors: ['A folder or file with this name already exists'] })
    );
    return;
  }

  try {
    await this.sdk.createFolder(folderName, into);
    req.flash('success', `Folder ${folderName} created.`);
    // All done, go to the just created folder
    res.redirect(this.folderHelpers.pathFor('list', folderName, into));
    req.app && req.app.emit(je('jingo.folderCreated'));
  } catch (err) {
    res.status(500).render('500', { err });
  }
};
