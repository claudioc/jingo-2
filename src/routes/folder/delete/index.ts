import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import FolderRoute from '..';

export const get: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return del.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: FolderRoute) => {
  return (req, res, next) => {
    return didDelete.apply(route, [req, res, next]);
  };
};

const del: RouteHandler = async function (this: FolderRoute, req, res, next) {
  this.title = 'Jingo – Deleting a folder';
  const folderName = req.query.folderName || '';
  const into = req.query.into || '';
  const csrfToken = (req as any).csrfToken();

  if (folderName === '') {
    return res.status(400).render('400');
  }

  if (!await this.assertDirectoryExists(into, req, res)) {
    return;
  }

  if (!await this.assertFolderExists(folderName, into, req, res)) {
    return;
  }

  const scope: object = {
    csrfToken,
    folderName,
    into
  };

  this.renderTemplate(res, __dirname, scope);
};

const didDelete: RouteHandler = async function (this: FolderRoute, req, res, next) {
  const folderName = req.body.folderName;
  const into = req.body.into;

  if (!await this.assertFolderExists(folderName, into, req, res)) {
    return;
  }

  req.flash('success', `Folder ${folderName} deleted.`);

  await this.sdk.deleteFolder(folderName, into);

  res.redirect(this.folderHelpers.pathFor('list', into));
  req.app && req.app.emit(je('jingo.folderDeleted'));
};
