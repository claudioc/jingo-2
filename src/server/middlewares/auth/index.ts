import { Config } from '@lib/config';

const middleware = (config: Config) => {
  return permission => {
    return (req, res, next) => {
      if (!res.locals.user || !res.locals.user.permissions.includes(permission)) {
        return res.redirect('/auth/login');
      } else {
        return next();
      }
    };
  };
};

export default middleware;
