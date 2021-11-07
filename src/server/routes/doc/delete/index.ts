import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import DocRoute from '..';

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return del.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return didDelete.apply(route, [req, res, next]);
  };
};

const del: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Deleting a document';
  const docName = req.query.docName || '';
  const into = req.query.into || '';
  const csrfToken = (req as any).csrfToken();

  if (docName === '') {
    return res.status(400).render('400');
  }

  if (!(await this.assertDirectoryExists(into, req, res))) {
    return;
  }

  if (!(await this.assertDocExists(docName, into, req, res))) {
    return;
  }

  const docTitle = this.wikiHelpers.unwikify(docName as string);

  const scope: object = {
    csrfToken,
    docName,
    docTitle,
    into
  };

  this.renderTemplate(res, __dirname, scope);
};

const didDelete: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Deleting a document';
  const docName = req.body.docName;
  const into = req.body.into;

  if (!(await this.assertDirectoryExists(into, req, res))) {
    return;
  }

  const itExists = await this.sdk.docExists(docName, into);
  if (!itExists) {
    res.redirect(this.config.mount(`/?e=1`));
    return;
  }

  await this.sdk.deleteDoc(docName, into);
  req.flash('success', `Document ${docName} deleted.`);

  res.redirect(this.folderHelpers.pathFor('list', into) + '?e=0');

  req.app &&
    req.app.emit(je('jingo.docDeleted'), {
      docName,
      into
    });
};
