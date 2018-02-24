import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as cheerio from 'cheerio'
import * as supertest from 'supertest'
import Route from '.'

import Server from '@server'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

test('get wiki redirect to root folder when folder is missing', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/wiki`)

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/`)
})

test('get wiki redirect to the welcome page if home page is missing', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/wiki/Home`)

  t.is(response.status, 302)
  t.is(response.headers.location, `/?welcome`)
})

test('get wiki renders home folder when folder is missing', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/wiki/`)

  t.is(response.status, 200)
})

test('get wiki renders 404 when document does not exist', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const docName = fakeFs.rndName()
  const response = await supertest(server.app)
    .get(`/wiki/${docName}`)

  t.is(response.status, 404)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), `Document not found`)
})

test('get wiki renders 404 when document and folder do not', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const docName = fakeFs.rndName()
  const response = await supertest(server.app)
    .get(`/wiki/somewhere/sometimes/${docName}`)

  t.is(response.status, 404)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), `Document not found`)
})

test('get wiki renders a page with success', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg, 'x/y')
  const server = Server.bootstrap(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const response = await supertest(server.app)
    .get(`/wiki/${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), docName)
})

test('get list renders 404 when document does not exist', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.rndName()
  const response = await supertest(server.app)
    .get(`/wiki/${folderName}/`)

  t.is(response.status, 404)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), `Folder not found`)
})

test('get list renders the list of docs with success', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const folderName = fakeFs.mkdirRnd()
  const response = await supertest(server.app)
    .get(`/wiki/${folderName}/`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('.breadcrumbs li').eq(1).text(), folderName)
})
