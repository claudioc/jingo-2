import { RouteEntry, RouteHandler } from '@routes/route';
import AuthRoute from '..';

export const get: RouteEntry = (route: AuthRoute) => {
  return (req, res, next) => {
    return logout.apply(route, [req, res, next]);
  };
};

const logout: RouteHandler = function(this: AuthRoute, req, res, next) {
  (req as any).logout();
  res.redirect('/');
};
