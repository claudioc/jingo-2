import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as supertest from 'supertest';
import Route from '..';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get update route with a non-existing doc', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/update?docName=${docName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get update route without a docName', async t => {
  const cfg = await fakeFs.config();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/update`);

  t.is(response.status, 400);
});

test('get update route with a non-existing into', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();
  const into = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/update?docName=${docName}&into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Editing a document');
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('get update route with existing doc', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/update?docName=${docName}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is(
    $('h3')
      .first()
      .text(),
    `Editing ${docName}`
  );
});

test('post update route is a failure if the file already exists (rename fails)', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const oldDocName = fakeFs.rndName();
  const newDocName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(oldDocName));
  fakeFs.writeFile(route.docHelpers.docNameToFilename(newDocName));

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/update?docName=${oldDocName}`)
    .send({
      content: 'whatever',
      docName: oldDocName,
      docTitle: newDocName
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('ul.errors li').length, 1);
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('Cannot rename a document')
  );
});

test('post update with a non existing into', async t => {
  const cfg = await fakeFs.config();
  const into = fakeFs.rndName();
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docTitle: 'xot',
      into
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Editing a document');
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('post update is a success (not renaming)', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docName,
      docTitle: docName
    });

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(docName));
  t.is(content, 'whatever');

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${docName}`);
});

test('post update is a success (renaming)', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const oldDocName = fakeFs.rndName();
  const newDocName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(oldDocName));

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docName: oldDocName,
      docTitle: newDocName
    });

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(newDocName));
  t.true(!fakeFs.exists(route.docHelpers.docNameToFilename(oldDocName)));
  t.is(content, 'whatever');

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${newDocName}`);
});
