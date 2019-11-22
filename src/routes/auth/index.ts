import { Config } from '@lib/config';
import { Strategy as MockStrategy } from '@lib/passport-mock-strategy';
import csrfMiddleware from '@middlewares/csrf';
import BaseRoute from '@routes/route';
import { Router } from 'express';
import * as passport from 'passport';
import { Strategy as LocalHtpasswdStrategy } from 'passport-local-htpasswd';

import { get as get_authLogin, post as post_authLogin } from './login';
import { get as get_authLogout } from './logout';

export default class AuthRoute extends BaseRoute {
  public static install(router: Router, config: Config) {
    const authFile = config.get('authentication.local.authFile');
    if (authFile) {
      passport.use(new LocalHtpasswdStrategy({ file: config.get('authentication.local.authFile') }));
    }
    const csrfProtection = csrfMiddleware(config);
    const route = new AuthRoute(config);
    router.get('/auth/logout', get_authLogout(route));
    router.get('/auth/login', csrfProtection, get_authLogin(route));

    const authMiddleware = passport.authenticate('local-htpasswd', {
      failureFlash: 'Invalid username or password.',
      failureRedirect: '/auth/login',
      successRedirect: '/'
    });

    router.post('/auth/login', [csrfProtection, authMiddleware], post_authLogin(route));

    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      passport.use(new MockStrategy({
        user: {
          displayName: 'A test user',
          emails: [{
            type: 'email',
            value: 'test-user@example.com'
          }],
          id: "1",
          name: {
            familyName: 'test',
            givenName: 'user'
          },
          provider: 'mock'
        }
      }));
      router.get('/auth/fake-login', passport.authenticate('mock'));
    }
  }
}
