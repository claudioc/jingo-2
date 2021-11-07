import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import { assign as _assign } from 'lodash';
import FolderRoute from '..';

export const get: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return rename.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return didRename.apply(route, [req, res, next]);
  };
};

const rename: RouteHandler = async function(this: FolderRoute, req, res, next) {
  this.title = 'Jingo – Renaming a folder';
  const folderName = req.query.folderName || '';
  const into = req.query.into || '';
  const csrfToken = (req as any).csrfToken();

  if (folderName === '') {
    return res.status(400).render('400');
  }

  if (!(await this.assertDirectoryExists(into, req, res))) {
    return;
  }

  if (!(await this.assertFolderExists(folderName, into, req, res))) {
    return;
  }

  const scope = {
    csrfToken,
    folderName,
    into
  };

  this.renderTemplate(res, __dirname, scope);
};

const didRename: RouteHandler = async function(this: FolderRoute, req, res, next) {
  const { errors, data } = this.inspectRequest(req);
  const folderName = data.folderName;
  const currentFolderName = data.currentFolderName;
  const into = data.into;
  const csrfToken = (req as any).csrfToken();

  const scope: object = {
    csrfToken,
    folderName,
    into
  };

  if (errors) {
    return this.renderTemplate(res, __dirname, _assign(scope, { errors }));
  }

  try {
    await this.sdk.renameFolder(currentFolderName, folderName, into);
    req.flash('success', `Folder ${currentFolderName} renamed to ${folderName}.`);
    res.redirect(this.folderHelpers.pathFor('list', folderName, into));
    req.app && req.app.emit(je('jingo.folderRenamed'));
  } catch (err) {
    res.status(500).render('500', { err });
  }
};
