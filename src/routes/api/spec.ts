import { config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as supertest from 'supertest'

process.env.NODE_ENV = 'test'

import Server from '@server'

const fakeFs = new FakeFs('/home/jingo')

test('post /api/render', async t => {
  const server = Server.bootstrap(await config())
  const response = await supertest(server.app)
    .post('/api/render')
    .send({ content: '### Hello World!' })

  t.is(response.status, 200)
  t.is(response.text, '<h3>Hello World!</h3>\n')
})

test('get /api/serve-static (404)', async t => {
  const server = Server.bootstrap(await config())
  const response = await supertest(server.app)
    .get('/api/serve-static/zot.js')

  t.is(response.status, 404)
})

// We cannot test the 200 because we cannot moke the file system
// that `send()` uses
// test('get /api/serve-static (200)', async t => {
// })

test('get /api/wiki (404)', async t => {
  const server = Server.bootstrap(await config())
  const response = await supertest(server.app)
    .get('/api/wiki/does-not-exist')
  t.is(response.status, 404)
})

test('get /api/wiki (200)', async t => {
  const server = Server.bootstrap(await fakeFs.config())
  fakeFs.writeFile('solomon_the_king.md', '### Solomon the King')
  const response = await supertest(server.app)
    .get('/api/wiki/solomon_the_king')
  t.is(response.status, 200)
  t.is(response.text, '<h3>Solomon the King</h3>\n')
})
