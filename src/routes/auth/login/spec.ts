import { config } from '@lib/config'
import test from 'ava'
import * as supertest from 'supertest'

process.env.NODE_ENV = 'test'

import Server from '@server'

test('get /auth/login', async t => {
  const server = Server.bootstrap(await config())
  const response = await supertest(server.app).get('/auth/login')

  t.is(response.status, 200)
  t.is(response.text, '<h3>Hello World!</h3>\n')
})
