import { Config } from '@lib/config';
import csrfMiddleware from '@middlewares/csrf';
import BaseRoute from '@routes/route';
import { Router } from 'express';
import * as passport from 'passport';
import { Strategy as LocalHtpasswdStrategy } from 'passport-local-htpasswd';

import { get as get_authLogin, post as post_authLogin } from './login';
import { get as get_authLogout } from './logout';

export default class AuthRoute extends BaseRoute {
  public static install(router: Router, config: Config) {
    passport.use(new LocalHtpasswdStrategy({ file: 'bzot' }));
    const csrfProtection = csrfMiddleware(config);
    const route = new AuthRoute(config);
    router.get('/auth/logout', get_authLogout(route));
    router.get('/auth/login', csrfProtection, get_authLogin(route));

    const authMiddleware = passport.authenticate('local-htpasswd', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: 'Invalid username or password.'
    });

    router.post('/auth/login', [csrfProtection, authMiddleware], post_authLogin(route));
  }
}
