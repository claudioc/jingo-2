import { Config } from '@lib/config';

import breadcrumbs from './breadcrumbs';
import custom from './custom';
import ellipsize from './ellipsize';
import hasAuth from './has-auth';
import hasFeature from './has-feature';
import timeAgo from './time-ago';
import urlFor from './url-for';
import userCan from './user-can';

export default function viewHelpers(config: Config) {
  return {
    breadcrumbs: breadcrumbs(config),
    custom: custom(config),
    ellipsize,
    hasAuth: hasAuth(config),
    hasFeature: hasFeature(config),
    timeAgo,
    urlFor: urlFor(config),
    userCan
  };
}
