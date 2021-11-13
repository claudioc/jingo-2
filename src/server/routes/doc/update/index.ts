import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import { assign as _assign } from 'lodash';
import DocRoute from '..';

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return update.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return didUpdate.apply(route, [req, res, next]);
  };
};

const update: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Editing a document';
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

  const doc = await this.sdk.loadDoc(docName as string, into as string);
  const wikiIndex = this.config.get('wiki.index');

  const docTitle = this.wikiHelpers.unwikify(docName as string);

  const scope: object = {
    content: doc.content,
    csrfToken,
    docName,
    docTitle,
    into,
    wikiIndex
  };

  if (req.app.get('requiresJson')) {
    res.json(scope);
  } else {
    this.renderTemplate(res, __dirname, scope);
  }
};

const didUpdate: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Editing a document';
  const { errors, data } = this.inspectRequest(req);
  const oldDocName = req.body.docName;
  const comment = req.body.comment;
  const into = data.into;
  const csrfToken = (req as any).csrfToken();

  const scope: object = {
    comment,
    content: data.content,
    csrfToken,
    docName: oldDocName,
    docTitle: data.docTitle,
    into
  };

  if (errors) {
    if (req.app.get('requiresJson')) {
      res.status(400);
      res.json({
        message: errors.join(', ')
      });
    } else {
      this.renderTemplate(res, __dirname, _assign(scope, { errors }));
    }
    return;
  }

  if (!(await this.assertDirectoryExists(into, req, res))) {
    return;
  }

  const newDocName = this.wikiHelpers.wikify(data.docTitle);

  try {
    await this.sdk.updateDoc(oldDocName, newDocName, data.content, into);
    req.flash('success', 'Document updated.');
  } catch (err) {
    this.renderTemplate(res, __dirname, _assign(scope, { errors: [err.message] }));
    return;
  }

  const cache = req.app.get('cache');
  if (cache) {
    cache.del(into + oldDocName);
  }

  if (req.app.get('requiresJson')) {
    res.json({
      wikiPath: this.wikiHelpers.pathFor(newDocName, into as string),
      docName: newDocName,
      into
    });
  } else {
    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into));
  }

  req.app &&
    req.app.emit(je('jingo.docUpdated'), {
      comment,
      docName: newDocName,
      oldDocName,
      into
    });
};
