import { config } from '@lib/config'
import test from 'ava'
import { nop as _nop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

test.todo('The api route')

test('post renderMarkdown', async t => {
  const route = new Route(await config())

  const request = {
    body: {
      content: '# Hello World!'
    }
  }

  const send = sinon.stub()
  const response = {
    status: sinon.stub().callsFake(() => {
      return {
        send
      }
    })
  }

  await route.renderMarkdown(request as any, response as any, _nop)

  t.is(response.status.calledWith(200), true)
  t.is(send.calledWith('<h1>Hello World!</h1>\n'), true)
})
