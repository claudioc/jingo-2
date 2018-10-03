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

test('get delete route with a non-existing doc', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/delete?docName=${docName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get delete route without a docName', async t => {
  const cfg = await fakeFs.config();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/delete`);

  t.is(response.status, 400);
});

test('get delete route with a non-existing into', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();
  const into = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/delete?docName=${docName}&into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Deleting a document');
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('get delete route for a existing doc', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/delete?docName=${docName}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is(
    $('h3')
      .first()
      .text(),
    `Deleting ${docName}`
  );
});

test('post delete with a non existing into', async t => {
  const cfg = await fakeFs.config();
  const into = fakeFs.rndName();
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/delete`)
    .send({
      docName: 'xot',
      into
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), 'Jingo – Deleting a document');
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('post delete route with a non-existing doc', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/delete?docName=${docName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('post delete is a success (renaming)', async t => {
  const cfg = await fakeFs.config();
  const route = new Route(cfg);
  const docName = fakeFs.rndName();
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName));

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app)
    .post(`/doc/delete`)
    .send({
      docName
    });

  t.true(!fakeFs.exists(route.docHelpers.docNameToFilename(docName)));

  t.is(response.status, 302);
  t.is(response.headers.location, '/wiki/?e=0');
});
