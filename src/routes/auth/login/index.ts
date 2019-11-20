import { RouteEntry, RouteHandler } from '@routes/route';
import AuthRoute from '..';

export const get: RouteEntry = (route: AuthRoute) => {
  return (req, res, next) => {
    return login.apply(route, [req, res, next]);
  };
};

export const post: RouteEntry = (route: AuthRoute) => {
  return (req, res, next) => {
    return didLogin.apply(route, [req, res, next]);
  };
};

const login: RouteHandler = function (this: AuthRoute, req, res, next) {
  const csrfToken = (req as any).csrfToken();
  const scope = {
    csrfToken,
    errors: req.flash().error
  };

  this.renderTemplate(res, __dirname, scope);
};

const didLogin: RouteHandler = function (this: AuthRoute, req, res, next) { };
