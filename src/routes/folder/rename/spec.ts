import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as supertest from 'supertest';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get rename route without the folder in argument', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const response = await supertest(server.app).get(`/folder/rename`);

  t.is(response.status, 400);
});

test('get rename route with the folder in argument (not existant)', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.rndName();
  const response = await supertest(server.app).get(`/folder/rename?folderName=${folderName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get rename route with the folder in argument (existant) and into (non existant)', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.rndName();
  const into = fakeFs.rndName();
  const response = await supertest(server.app).get(
    `/folder/rename?folderName=${folderName}&into=${into}`
  );

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Renaming a folder`);
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('get rename route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  fakeFs.mkdir(path.join(into, folderName));
  const response = await supertest(server.app).get(
    `/folder/rename?folderName=${folderName}&into=${into}`
  );

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Renaming a folder`);
  t.is($('input[name="into"]').attr('value'), into);
});

test('post rename route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config();
  const server = Server.bootstrap(cfg);
  const folderName = fakeFs.rndName();
  const newFolderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  fakeFs.mkdir(path.join(into, folderName));
  const response = await supertest(server.app)
    .post(`/folder/rename`)
    .send({
      currentFolderName: folderName,
      folderName: newFolderName,
      into
    });

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${into}/${newFolderName}/`);
  t.true(fakeFs.exists(path.join(into, newFolderName)));
  t.true(!fakeFs.exists(path.join(into, folderName)));
});
