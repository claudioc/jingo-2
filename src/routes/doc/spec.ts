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

test('get create with a docName in the url', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), `Creating ${docName}`)
  t.is($('input[name="docTitle"]').attr('type'), 'text')
})

test('get create for the home page', async t => {
  const cfg = await fakeFs.config()
  const docName = cfg.get('wiki.index')
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), `Creating ${docName}`)
  t.is($('input[name="docTitle"]').attr('type'), 'hidden')
})

test('get create with an already existing docName in the url', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${docName}`)
})

test('get create without a docName in the url', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get('/doc/create')

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), 'Creating a new document')
})

test('get create with a non existing into in the url', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('post create fail with missing fields', async t => {
  const cfg = await fakeFs.config()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('ul.errors li').length, 2)
})

test('post create fail when doc already exists', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)
    .send({
      content: 'whatever',
      docTitle: docName
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('ul.errors li').length, 1)
  t.true($('ul.errors li').first().text().startsWith('A document with'))
})

test('post create success redirects to the wiki page', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)
    .send({
      content: 'whatever',
      docTitle: docName
    })

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${docName}`)
  t.true(fakeFs.exists(route.docHelpers.docNameToFilename(docName)))
})

test('get update route with a non-existing doc', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/update?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get update route without a docName', async t => {
  const cfg = await fakeFs.config()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/update`)

  t.is(response.status, 400)
})

test('get update route with a non-existing into', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/update?docName=${docName}&into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Editing a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('get update route with existing doc', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/update?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), `Editing "${docName}"`)
})

test('post update route is a failure if the file already exists (rename fails)', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const oldDocName = fakeFs.rndName()
  const newDocName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(oldDocName))
  fakeFs.writeFile(route.docHelpers.docNameToFilename(newDocName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/update?docName=${oldDocName}`)
    .send({
      content: 'whatever',
      docName: oldDocName,
      docTitle: newDocName
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('ul.errors li').length, 1)
  t.true($('ul.errors li').first().text().startsWith('Cannot rename a document'))
})

test('post update with a non existing into', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docTitle: 'xot',
      into
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Editing a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('post update is a success (not renaming)', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docName,
      docTitle: docName
    })

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(docName))
  t.is(content, 'whatever')

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${docName}`)
})

test('post update is a success (renaming)', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const oldDocName = fakeFs.rndName()
  const newDocName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(oldDocName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/update`)
    .send({
      content: 'whatever',
      docName: oldDocName,
      docTitle: newDocName
    })

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(newDocName))
  t.true(!fakeFs.exists(route.docHelpers.docNameToFilename(oldDocName)))
  t.is(content, 'whatever')

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${newDocName}`)
})

test('get delete route with a non-existing doc', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/delete?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get delete route without a docName', async t => {
  const cfg = await fakeFs.config()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/delete`)

  t.is(response.status, 400)
})

test('get delete route with a non-existing into', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/delete?docName=${docName}&into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Deleting a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('get delete route for a existing doc', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/delete?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('h1').first().text(), `Deleting "${docName}"`)
})

test('post delete with a non existing into', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/delete`)
    .send({
      docName: 'xot',
      into
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Deleting a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('post delete route with a non-existing doc', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/delete?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('post delete is a success (renaming)', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/delete`)
    .send({
      docName
    })

  t.true(!fakeFs.exists(route.docHelpers.docNameToFilename(docName)))

  t.is(response.status, 302)
  t.is(response.headers.location, '/wiki/?e=0')
})

test('get history route with a non-existing doc', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/history?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})

test('get history route without a docName', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/history`)

  t.is(response.status, 400)
})

test('get history route with a non-existing into', async t => {
  const cfg = await fakeFs.config()
  cfg.enableFeature('gitSupport')
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/history?docName=${docName}&into=${into}`)

  t.is(response.status, 302)
  t.is(response.headers.location, cfg.get('mountPath') + '?e=1')
})
