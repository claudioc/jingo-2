import { je } from '@events/index';
import { RouteEntry, RouteHandler } from '@routes/route';
import { assign as _assign } from 'lodash';
import DocRoute from '..';

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return create.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return didCreate.apply(route, [req, res, next]);
  };
};

const create: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Creating a document';
  const docTitle = req.query.docTitle || '';
  const into = req.query.into || '';
  const csrfToken = (req as any).csrfToken();
  const docName = this.wikiHelpers.wikify(docTitle as string);

  if (!(await this.assertDirectoryExists(into, req, res))) {
    if (req.app.get('requiresJson')) {
      res.status(400);
      res.json({
        message: `The directory ${into} does not exist.`
      });
    }
    return;
  }

  if (!(await this.assertDocDoesNotExist(docName, into, req, res))) {
    if (req.app.get('requiresJson')) {
      res.status(400);
      res.json({
        message: `A document with that name ${docName} already exists`
      });
    }
    return;
  }

  const wikiIndex = this.config.get('wiki.index');
  const scope: object = {
    csrfToken,
    docTitle,
    docName,
    wikiPath: this.wikiHelpers.pathFor(docName, into as string),
    into,
    wikiIndex
  };

  if (req.app.get('requiresJson')) {
    res.json(scope);
  } else {
    this.renderTemplate(res, __dirname, scope);
  }
};

const didCreate: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Creating a document';
  const { errors, data } = this.inspectRequest(req);
  const into = data.into || '';
  const csrfToken = (req as any).csrfToken();

  const scope: object = {
    content: data.content,
    csrfToken,
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
    if (req.app.get('requiresJson')) {
      res.status(400);
      res.json({
        message: `The directory ${into} does not exist.`
      });
    }
    return;
  }

  const docName = this.wikiHelpers.wikify(data.docTitle);

  const itExists = await this.sdk.docExists(docName, into);
  if (itExists) {
    if (req.app.get('requiresJson')) {
      res.status(400);
      res.json({
        message: `A document with that name ${docName} already exists`
      });
    } else {
      this.renderTemplate(
        res,
        __dirname,
        _assign(scope, {
          errors: ['A document with this title already exists']
        })
      );
    }
    return;
  }

  await this.sdk.createDoc(docName, data.content, into);

  if (req.app.get('requiresJson')) {
    res.json({
      wikiPath: this.wikiHelpers.pathFor(docName, into as string),
      docName,
      into
    });
  } else {
    req.flash('success', `Document ${docName} created.`);
    // All done, go to the just saved page
    res.redirect(this.wikiHelpers.pathFor(data.docTitle, into));
  }

  req.app.emit(je('jingo.docCreated'), {
    docName,
    into
  });
};
