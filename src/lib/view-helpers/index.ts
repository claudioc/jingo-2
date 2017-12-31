import { Config } from '@lib/config'
import doc from '@lib/doc'
import folder from '@lib/folder'
import wiki from '@lib/wiki'
import {
  isEmpty as _isEmpty,
  omit as _omit,
  omitBy as _omitBy,
  take as _take
} from 'lodash'

import * as qs from 'querystring'

export default function viewHelpers (config: Config) {
  const wikiHelpers = wiki(config)
  const docHelpers = doc(config)
  const folderHelpers = folder(config)
  return {
    breadcrumb (params) {
      const { dirName } = params.hash
      const basePath = config.get('wiki.basePath')
      const parts = dirName.split('/')
      const breadcrumb = ['<ul class="breadcrumb">']
      breadcrumb.push(`<li><a href="/${basePath}/">Index</a></li>`)
      for (let i = 0; i < parts.length - 1; i++) {
        const bite = _take(parts, i + 1)
        const path = bite.join('/')
        const text = bite[bite.length - 1]
        breadcrumb.push(`<li><a href="/${basePath}/${path}/">${text}</a></li>`)
      }
      breadcrumb.push(`<li>${parts[parts.length - 1]}</li></ul>`)
      return breadcrumb.join('')
    },

    urlFor (params) {
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
          const proxyPath = config.get('proxyPath')
          path = `${proxyPath}public/${resource}/${id}`
          break
      }

      // Gather all the unknown params, and mutate them in a query string
      const aliens = _omitBy(_omit(params.hash, KNOWN_PARAMS), _isEmpty)
      const queryString = (Object.keys(aliens).length > 0 ? `?${qs.stringify(aliens)}` : '')
      return `${path}${queryString}`
    }
  }
}
