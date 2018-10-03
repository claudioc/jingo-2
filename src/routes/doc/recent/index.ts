import { RouteEntry, RouteHandler } from '@routes/route';
import { cloneDeep as _clone } from 'lodash';
import DocRoute from '..';

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return recent.apply(route, [req, res, next]);
  };
};

const recent: RouteHandler = async function(this: DocRoute, req, res, next) {
  this.title = 'Jingo – Recent edits';

  let items;
  try {
    items = await this.git.$recent();
  } catch (err) {
    res.status(500).render('500', { err });
    return;
  }

  const recentEdits = items.map(item => {
    const log = _clone(item[1]);
    log.date = new Date(log.date * 1000);
    return {
      item: this.docHelpers.splitPath(item[0]),
      log
    };
  });

  const scope: object = {
    recentEdits
  };

  this.renderTemplate(res, __dirname, scope);
};
