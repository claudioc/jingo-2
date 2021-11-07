import { Config } from '@lib/config';
import * as csurf from 'csurf';

const dummyCsrf = (req, res, next) => {
  req.csrfToken = () => {
    return 'smile';
  };

  next();
};

const csrfMiddleware = (config: Config) => {
  let method;

  // Testing routes with csrfProtection can get really too hacky
  // so we rather disable the csrfProtection during tests
  if (config.hasFeature('csrfProtection')) {
    method = csurf();
  } else {
    method = dummyCsrf;
  }

  return method;
};

export default csrfMiddleware;
