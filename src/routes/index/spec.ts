import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as supertest from 'supertest';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test('get index', async t => {
  const cfg = await fakeFs.config();
  const home = cfg.get('wiki.index');
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/`);

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${home}`);
});

test('get welcome', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/?welcome`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is(
    $('h1')
      .first()
      .text(),
    `Welcome to Jingo`
  );
});
