import { Config } from '@lib/config'

import breadcrumbs from './breadcrumbs'
import custom from './custom'
import ellipsize from './ellipsize'
import hasFeature from './has-feature'
import timeAgo from './time-ago'
import urlFor from './url-for'

export default function viewHelpers(config: Config) {
  return {
    breadcrumbs: breadcrumbs(config),
    custom: custom(config),
    ellipsize,
    hasFeature: hasFeature(config),
    timeAgo,
    urlFor: urlFor(config)
  }
}
