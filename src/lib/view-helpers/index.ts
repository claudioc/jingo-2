import { Config } from '@lib/config'
import doc from '@lib/doc'
import folder from '@lib/folder'
import { mcache } from '@lib/mcache'
import wiki from '@lib/wiki'
import sdk from '@sdk'
import { distanceInWordsToNow } from 'date-fns'
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
  const theSdk = sdk(config)
  const cache = mcache()

  return {
    timeAgo (params) {
      const { date } = params.hash
      return distanceInWordsToNow(date) + ' ago'
    },

    hasFeature (params) {
      const feature = params
      return config.hasFeature(feature)
    },

    breadcrumb (params) {
      const { dirName } = params.hash
      const basePath = config.get('wiki.basePath')
      const parts = dirName.split('/')
      const breadcrumb = ['<ul>']
      breadcrumb.push(`<li><a href="/${basePath}/">Index</a></li>`)
      for (let i = 0; i < parts.length - 1; i++) {
        const bite = _take(parts, i + 1)
        const path = bite.join('/')
        const text = bite[bite.length - 1]
        breadcrumb.push(`<li><a href="/${basePath}/${path}/">${text}</a></li>`)
      }

      const last = parts[parts.length - 1]
      if (last !== '') {
        breadcrumb.push(`<li><span>${last}</span></li></ul>`)
      }
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
          path = config.mount(`public/${resource}/${id}`)
          break
      }

      // Gather all the unknown params, and mutate them in a query string
      const aliens = _omitBy(_omit(params.hash, KNOWN_PARAMS), _isEmpty)
      const queryString = (Object.keys(aliens).length > 0 ? `?${qs.stringify(aliens)}` : '')
      return `${path}${queryString}`
    },

    customScripts () {
      const scripts = config.get('custom.scripts')
      if (scripts.length === 0) {
        return ''
      }
      const baseUrl = config.mount(`api/serve-static/`)
      return scripts.map(script => `<script src="${baseUrl}${script}"></script>`).join('\n')
    },

    customStyles () {
      const styles = config.get('custom.styles')
      if (styles.length === 0) {
        return ''
      }
      const baseUrl = config.mount(`api/serve-static/`)
      return styles.map(style => `<link rel="stylesheet" href="${baseUrl}${style}">`).join('\n')
    },

    customIncludes () {
      const includes = config.get('custom.includes')
      if (includes.length === 0) {
        return ''
      }

      // We need a synchronous loop to be able to collect all the includes at once
      const output = []
      for (const include of includes) {
        let content = cache.get(include)
        if (!content) {
          try {
            content = theSdk.loadFileSync(include)
            cache.put(include, content, 1800 * 1000)
          } catch (_) {
            // Never mind...
          }
        }
        output.push(content)
      }

      return output.join('\n')
    }
  }
}
