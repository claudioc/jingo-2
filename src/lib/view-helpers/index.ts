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
      const parts = dirName.split('/')
      const breadcrumb = ['<ul class="breadcrumb">']
      breadcrumb.push(`<li><a href="/wiki/">..</a></li>`)
      for (let i = 0; i < parts.length - 1; i++) {
        const bite = _take(parts, i + 1)
        const path = bite.join('/')
        const text = bite[bite.length - 1]
        breadcrumb.push(`<li><a href="/wiki/${path}/">${text}</a></li>`)
      }
      breadcrumb.push(`<li>${parts[parts.length - 1]}</li></ul>`)
      return breadcrumb.join('')
    },

    urlFor (params) {
      const KNOWN_PARAMS = ['resource', 'id', 'action']
      const { resource, id, action } = params.hash
      let path
      switch (resource) {
        // Access to any document
        case 'doc':
          path = docHelpers.docPathFor(id, action || 'create')
          break

        // Access to any wiki page
        case 'wiki':
          path =  wikiHelpers.wikiPathFor(id)
          break

        // Access to any folder
        case 'folder':
          path = folderHelpers.pathFor(action || 'create', id)
          break

        // Access to the home page of the system
        case 'home':
          path =  wikiHelpers.wikiPathFor(config.get('wiki.index'))
          break
      }

      // Gather all the unknown params, and mutate them in a query string
      const aliens = _omitBy(_omit(params.hash, KNOWN_PARAMS), _isEmpty)
      const queryString = (Object.keys(aliens).length > 0 ? `?${qs.stringify(aliens)}` : '')
      return `${path}${queryString}`
    }
  }
}
