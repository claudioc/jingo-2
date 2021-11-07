import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as supertest from 'supertest';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get history route with a non-existing doc', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');
  const docName = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/history?docName=${docName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get history route without a docName', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/history`);

  t.is(response.status, 400);
});

test('get history route with a non-existing into', async t => {
  const cfg = await fakeFs.config();
  cfg.enableFeature('gitSupport');
  const docName = fakeFs.rndName();
  const into = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/history?docName=${docName}&into=${into}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get history route gives 404 without git support', async t => {
  const cfg = await fakeFs.config();
  const docName = fakeFs.rndName();
  const into = fakeFs.rndName();

  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/doc/history?docName=${docName}&into=${into}`);

  t.is(response.status, 404);
});
