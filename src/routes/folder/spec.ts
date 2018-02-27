import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as cheerio from 'cheerio'
import * as path from 'path'
import * as supertest from 'supertest'

import Server from '@server'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

test('get create route with the folder in argument', async t => {
  const cfg = await fakeFs.config()
  const folderName = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/create?folderName=${folderName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Creating a folder`)
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating ${folderName}`
  )
  t.is($('input[name="folderName"]').attr('type'), 'text')
  t.is($('input[name="folderName"]').attr('value'), folderName)
})

test('get create route without the folder in argument', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/create`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Creating a folder`)
  t.is(
    $('h3')
      .first()
      .text(),
    `Creating a folder`
  )
  t.is($('input[name="folderName"]').attr('type'), 'text')
})

test('get create route with non existing into', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/create?into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Creating a folder`)
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  )
})

test('get create route with existing into', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.mkdirRnd()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/create?into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Creating a folder`)
  t.is($('input[name="into"]').attr('value'), into)
})

test('get create fails if folder already exists', async t => {
  const cfg = await fakeFs.config()
  const folderName = fakeFs.mkdirRnd()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/create?folderName=${folderName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${folderName}/`)
})

test('post create fails if folder already exists', async t => {
  const cfg = await fakeFs.config()
  const folderName = fakeFs.mkdirRnd()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/folder/create`)
    .send({
      folderName,
      into: ''
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('ul.errors li').length, 1)
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('A folder or file with')
  )
})

test('post create fails if folder already exists within into', async t => {
  const cfg = await fakeFs.config()
  const folderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  fakeFs.mkdir(path.join(into, folderName))
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/folder/create`)
    .send({
      folderName,
      into
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('ul.errors li').length, 1)
  t.true(
    $('ul.errors li')
      .first()
      .text()
      .startsWith('A folder or file with')
  )
})

test('post create succeded', async t => {
  const cfg = await fakeFs.config()
  const folderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/folder/create`)
    .send({
      folderName,
      into
    })

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${into}/${folderName}/`)
  t.true(fakeFs.exists(path.join(into, folderName)))
})

test('get rename route without the folder in argument', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/rename`)

  t.is(response.status, 400)
})

test('get rename route with the folder in argument (not existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const response = await supertest(server.app).get(`/folder/rename?folderName=${folderName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get rename route with the folder in argument (existant) and into (non existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const into = fakeFs.rndName()
  const response = await supertest(server.app).get(
    `/folder/rename?folderName=${folderName}&into=${into}`
  )

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Renaming a folder`)
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  )
})

test('get rename route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  fakeFs.mkdir(path.join(into, folderName))
  const response = await supertest(server.app).get(
    `/folder/rename?folderName=${folderName}&into=${into}`
  )

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Renaming a folder`)
  t.is($('input[name="into"]').attr('value'), into)
})

test('post rename route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const newFolderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  fakeFs.mkdir(path.join(into, folderName))
  const response = await supertest(server.app)
    .post(`/folder/rename`)
    .send({
      currentFolderName: folderName,
      folderName: newFolderName,
      into
    })

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${into}/${newFolderName}/`)
  t.true(fakeFs.exists(path.join(into, newFolderName)))
  t.true(!fakeFs.exists(path.join(into, folderName)))
})

test('get delete route without the folder in argument', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/folder/delete`)

  t.is(response.status, 400)
})

test('get delete route with the folder in argument (not existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const response = await supertest(server.app).get(`/folder/delete?folderName=${folderName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get delete route with the folder in argument (existant) and into (non existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const into = fakeFs.rndName()
  const response = await supertest(server.app).get(
    `/folder/delete?folderName=${folderName}&into=${into}`
  )

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Deleting a folder`)
  t.is(
    $('h1')
      .first()
      .text(),
    "We've got a problem here…"
  )
})

test('get delete route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  fakeFs.mkdir(path.join(into, folderName))
  const response = await supertest(server.app).get(
    `/folder/delete?folderName=${folderName}&into=${into}`
  )

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), `Jingo – Deleting a folder`)
  t.is($('input[name="into"]').attr('value'), into)
})

test('post delete route with the folder in argument (existant) and into (existant)', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const into = fakeFs.mkdirRnd()
  fakeFs.mkdir(path.join(into, folderName))
  const response = await supertest(server.app)
    .post(`/folder/delete`)
    .send({
      folderName,
      into
    })

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${into}/`)
  t.true(!fakeFs.exists(path.join(into, folderName)))
})
