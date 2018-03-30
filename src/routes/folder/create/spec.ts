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
