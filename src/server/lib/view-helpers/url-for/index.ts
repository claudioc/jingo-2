import doc from '@lib/doc';
import folder from '@lib/folder';
import Queso from '@lib/queso';
import wiki from '@lib/wiki';

import { isEmpty as _isEmpty, omit as _omit, omitBy as _omitBy } from 'lodash';

export default config => {
  const wikiHelpers = wiki(config);
  const docHelpers = doc(config);
  const folderHelpers = folder(config);

  return params => {
    const KNOWN_PARAMS = ['action', 'id', 'into', 'resource'];
    const { resource, id, action, into } = params.hash;
    let path;
    switch (resource) {
      // Access to any document
      case 'doc':
        path = docHelpers.pathFor(action || 'create', id, into);
        break;

      // Access to any wiki page
      case 'wiki':
        path = wikiHelpers.pathFor(id, into);
        break;

      // Access to any folder
      case 'folder':
        path = folderHelpers.pathFor(action || 'create', id, into);
        break;

      // Access to the home page of the system
      case 'home':
        path = wikiHelpers.pathFor(config.get('wiki.index'));
        break;

      case 'vendor':
      case 'css':
      case 'img':
      case 'js':
        path = config.mount(`public/${resource}/${id}`);
        break;
    }

    // Gather all the unknown params, and mutate them in a query string
    const aliens = _omitBy(_omit(params.hash, KNOWN_PARAMS), _isEmpty);

    let queryString = '';
    if (Object.keys(aliens).length > 0) {
      const queso = new Queso();
      queso.extractFromMap(aliens);
      queso.extractFromUrl(path);
      queryString = queso.stringify();
      const q = path.indexOf('?');
      if (q > 0) {
        path = path.substr(0, q);
      }
    }

    return `${path}${queryString}`;
  };
};
