import { config } from '@lib/config'
import test from 'ava'
import { noop as _noop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

test('Send a 404 if folder doesn\'t exist', async t => {
  const route = new Route(await config(), 'x/y')
  sinon.stub(route, 'render')

  const request = {
    params: {
      path: 'pappero/'
    }
  }

  const response = {
    status: sinon.stub().callsFake(() => {
      return {
        render: () => {
          //
        }
      }
    })
  }

  await route.list(request as any, response as any, _noop)

  t.is(route.title, 'Jingo – List of documents')

  t.is(response.status.calledWith(404), true)
})
