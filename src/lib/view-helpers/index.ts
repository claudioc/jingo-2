import { Config } from '@lib/config'
import { mcache } from '@lib/mcache'
import sdk from '@sdk'

import breadcrumbs from './breadcrumbs'
import ellipsize from './ellipsize'
import hasFeature from './has-feature'
import timeAgo from './time-ago'
import urlFor from './url-for'

export default function viewHelpers (config: Config) {
  const theSdk = sdk(config)
  const cache = mcache()

  return {
    ellipsize,

    timeAgo,

    hasFeature: hasFeature(config),

    breadcrumbs: breadcrumbs(config),

    urlFor: urlFor(config),

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
