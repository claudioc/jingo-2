import { config } from '@lib/config';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as supertest from 'supertest';

process.env.NODE_ENV = 'test';

import Server from '@server';

test('get /auth/login', async t => {
  const server = Server.bootstrap(await config());
  const response = await supertest(server.app).get('/auth/login');

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is(
    $('h2')
      .first()
      .text(),
    'Sign-in'
  );
});
