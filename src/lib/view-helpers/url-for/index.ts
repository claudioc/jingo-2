import doc from '@lib/doc'
import folder from '@lib/folder'
import wiki from '@lib/wiki'

import {
  isEmpty as _isEmpty,
  omit as _omit,
  omitBy as _omitBy
} from 'lodash'

import * as qs from 'querystring'

let makeHelper

export default makeHelper = (config) => {
  const wikiHelpers = wiki(config)
  const docHelpers = doc(config)
  const folderHelpers = folder(config)

  return (params) => {
    const KNOWN_PARAMS = ['action', 'id', 'into', 'resource']
    const { resource, id, action, into } = params.hash
    let path
    switch (resource) {
      // Access to any document
      case 'doc':
        path = docHelpers.pathFor(action || 'create', id, into)
        break

      // Access to any wiki page
      case 'wiki':
        path =  wikiHelpers.pathFor(id, into)
        break

      // Access to any folder
      case 'folder':
        path = folderHelpers.pathFor(action || 'create', id, into)
        break

      // Access to the home page of the system
      case 'home':
        path = wikiHelpers.pathFor(config.get('wiki.index'))
        break

      case 'vendor':
      case 'css':
      case 'js':
        path = config.mount(`public/${resource}/${id}`)
        break
    }

    // Gather all the unknown params, and mutate them in a query string
    const aliens = _omitBy(_omit(params.hash, KNOWN_PARAMS), _isEmpty)
    const queryString = (Object.keys(aliens).length > 0 ? `?${qs.stringify(aliens)}` : '')
    return `${path}${queryString}`
  }
}
