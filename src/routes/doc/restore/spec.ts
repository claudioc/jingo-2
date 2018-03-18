import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as cheerio from 'cheerio'
import * as supertest from 'supertest'
import Route from '..'

import Server from '@server'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

test('get restore route without git support', async t => {
  const cfg = await fakeFs.config()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/doc/restore`)

  t.is(response.status, 404)
})

test('get restore route without a docName', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/doc/restore`)

  t.is(response.status, 400)
})

test('get restore route without a version', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/doc/restore`)

  t.is(response.status, 400)
})

test('get restore route with a non-existing doc', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')

  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/doc/restore?docName=${docName}&v=1`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get restore route for a existing docs', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app).get(`/doc/restore?docName=${docName}&v=1`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.true(
    $('h3')
      .first()
      .text()
      .startsWith('Restoring an old version')
  )
})
