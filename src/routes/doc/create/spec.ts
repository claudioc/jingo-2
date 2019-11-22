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

test('get create with a docName in the url', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/create?docName=${docName}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Creating a document');
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating ${docName}`
  );
  t.is($('input[name="docTitle"]').attr('type'), 'text');
});

test('get create for the home page', async t => {
  const cfg = await fakeFs.config();
  const docName = cfg.get('wiki.index');
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/create?docName=${docName}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Creating a document');
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating ${docName}`
  );
  t.is($('input[name="docTitle"]').attr('type'), 'hidden');
});

test('get create with an already existing docName in the url', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/create?docName=${docName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${docName}`);
});

test('get create without a docName in the url', async t => {
  const cfg = await fakeFs.config();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get('/doc/create');

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Creating a document');
  t.is(
    $('h3')
      .first()
      .text(),
    'Creating a new document'
  );
});

test('get create with a non existing into in the url', async t => {
  const cfg = await fakeFs.config();
  const into = fakeFs.rndName();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/doc/create?into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Creating a document');
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('post create fails with missing fields', async t => {
  const cfg = await fakeFs.config();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.post('/doc/create');

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Creating a document');
  t.is($('ul.errors li').length, 2);
});

test('post create fails when doc already exists', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request
    .post(`/doc/create`)
    .send({
      content: 'whatever',
      docTitle: docName
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('ul.errors li').length, 1);
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('A document with')
  );
});

test('post create success redirects to the wiki page', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request
    .post('/doc/create')
    .send({
      content: 'whatever',
      docTitle: docName
    });

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${docName}`);
  t.true(fakeFs.exists(route.docHelpers.docNameToFilename(docName)));
});
