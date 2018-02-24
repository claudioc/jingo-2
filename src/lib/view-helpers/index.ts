import { Config } from '@lib/config'

import breadcrumbs from './breadcrumbs'
import customIncludes from './custom-includes'
import customScripts from './custom-scripts'
import customStyles from './custom-styles'
import ellipsize from './ellipsize'
import hasFeature from './has-feature'
import timeAgo from './time-ago'
import urlFor from './url-for'

export default function viewHelpers (config: Config) {
  return {
    breadcrumbs: breadcrumbs(config),
    customIncludes: customIncludes(config),
    customScripts: customScripts(config),
    customStyles: customStyles(config),
    ellipsize,
    hasFeature: hasFeature(config),
    timeAgo,
    urlFor: urlFor(config)
  }
}
