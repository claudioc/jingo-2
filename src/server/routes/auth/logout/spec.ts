import { config } from '@lib/config';
import test from 'ava';
import * as supertest from 'supertest';

process.env.NODE_ENV = 'test';

import Server from '@server';

test('get /auth/logout', async t => {
  const server = Server.bootstrap(await config());
  const response = await supertest(server.app).get('/auth/logout');

  t.is(response.status, 302);
  t.is(response.headers.location, '/');
});
