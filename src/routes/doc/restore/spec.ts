import createAuthenticatedRequest from '@lib/create-authenticated-request';
import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import Route from '..';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get restore route without git support', async t => {
  const cfg = await fakeFs.config();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get('/doc/restore');

  t.is(response.status, 404);
});

test('get restore route without a docName', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get('/doc/restore');

  t.is(response.status, 400);
});

test('get restore route without a version', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get('/doc/restore');

  t.is(response.status, 400);
});

test('get restore route with a non-existing doc', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');

  const docName = fakeFs.rndName();

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/restore?docName=${docName}&v=1`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get restore route for a existing docs', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/restore?docName=${docName}&v=1`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.true(
    $('h3')
      .first()
      .text()
      .startsWith('Restoring an old version')
  );
});
