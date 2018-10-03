import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as supertest from 'supertest';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get list renders 404 when document does not exist', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.rndName();
  const response = await supertest(server.app).get(`/wiki/${folderName}/`);

  t.is(response.status, 404);
  const $ = cheerio.load(response.text);
  t.is(
    $('h1')
      .first()
      .text(),
    `Folder not found`
  );
});

test('get list renders the list of docs with success', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.mkdirRnd();
  const response = await supertest(server.app).get(`/wiki/${folderName}/`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is(
    $('.breadcrumbs li')
      .eq(1)
      .text(),
    folderName
  );
});
