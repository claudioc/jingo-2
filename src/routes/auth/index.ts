import { Config } from '@lib/config';
import csrfMiddleware from '@middlewares/csrf';
import BaseRoute from '@routes/route';
import { Router } from 'express';

import { get as get_authLogin, post as post_authLogin } from './login';

export default class AuthRoute extends BaseRoute {
  public static create(router: Router, config: Config) {
    const csrfProtection = csrfMiddleware(config);
    const route = new AuthRoute(config);
    router.get('/auth/login', csrfProtection, get_authLogin(route));
    router.post('/auth/login', csrfProtection, post_authLogin(route));
  }
}
