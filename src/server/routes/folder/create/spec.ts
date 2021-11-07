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

test('get create route with the folder in argument', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/create?folderName=${folderName}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Creating a folder`);
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating ${folderName}`
  );
  t.is($('input[name="folderName"]').attr('type'), 'text');
  t.is($('input[name="folderName"]').attr('value'), folderName);
});

test('get create route without the folder in argument', async t => {
  const cfg = await fakeFs.config();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/create`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Creating a folder`);
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating a folder`
  );
  t.is($('input[name="folderName"]').attr('type'), 'text');
});

test('get create route with non existing into', async t => {
  const cfg = await fakeFs.config();
  const into = fakeFs.rndName();

  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/create?into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Creating a folder`);
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  );
});

test('get create route with existing into', async t => {
  const cfg = await fakeFs.config();
  const into = fakeFs.mkdirRnd();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/create?into=${into}`);

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('title').text(), `Jingo – Creating a folder`);
  t.is($('input[name="into"]').attr('value'), into);
});

test('get create fails if folder already exists', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.mkdirRnd();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request.get(`/folder/create?folderName=${folderName}`);

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${folderName}/`);
});

test('post create fails if folder already exists', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.mkdirRnd();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));

  const response = await request
    .post('/folder/create')
    .send({
      folderName,
      into: ''
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('ul.errors li').length, 1);
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('A folder or file with')
  );
});

test('post create fails if folder already exists within into', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  fakeFs.mkdir(path.join(into, folderName));
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request
    .post(`/folder/create`)
    .send({
      folderName,
      into
    });

  t.is(response.status, 200);
  const $ = cheerio.load(response.text);
  t.is($('ul.errors li').length, 1);
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('A folder or file with')
  );
});

test('post create succeded', async t => {
  const cfg = await fakeFs.config();
  const folderName = fakeFs.rndName();
  const into = fakeFs.mkdirRnd();
  const request = await createAuthenticatedRequest(Server.bootstrap(cfg));
  const response = await request
    .post(`/folder/create`)
    .send({
      folderName,
      into
    });

  t.is(response.status, 302);
  t.is(response.headers.location, `/wiki/${into}/${folderName}/`);
  t.true(fakeFs.exists(path.join(into, folderName)));
});
