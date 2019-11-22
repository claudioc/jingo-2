import createAuthenticatedRequest from '@lib/create-authenticated-request';
import FakeFs from '@lib/fake-fs';
import test from 'ava';
import * as cheerio from 'cheerio';
import * as path from 'path';

import Server from '@server';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('get delete route without the folder in argument', async t => {
  const cfg = await fakeFs.config();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get('/folder/delete');

  t.is(response.status, 400);
});

test('get delete route with the folder in argument (not existant)', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/delete?folderName=${folderName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1');
});

test('get delete route with the folder in argument (existant) and into (non existant)', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const into = fakeFs.rndName();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/delete?folderName=${folderName}&into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Deleting a folder`);
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('get delete route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  fakeFs.mkdir(path.join(into, folderName));

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/delete?folderName=${folderName}&into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Deleting a folder`);
  t.is($('input[name="into"]').attr('value'), into);
});

test('post delete route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  fakeFs.mkdir(path.join(into, folderName));

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request
    .post(`/folder/delete`)
    .send({
      folderName,
      into
    });

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${into}/`);
  t.true(!fakeFs.exists(path.join(into, folderName)));
});
