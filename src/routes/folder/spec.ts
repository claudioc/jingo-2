import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import { nop as _nop } from 'lodash'
import * as path from 'path'
import * as sinon from 'sinon'
import Route from '.'

const fakeFs = new FakeFs('/home/jingo')

const useFakeFs = (config: Config) => {
  config.setFs(fakeFs.theFs).set('documentRoot', fakeFs.mountPoint)
}

test.after(() => {
  fakeFs.unmount()
})

test('get create route', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {}
  }
  await route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a folder')

  t.is(render.calledWith(request, null, 'folder-create'), true)
})

test('post create fail if folder already exists', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const folderName = fakeFs.rndName()
  const render = sinon.stub(route, 'render')
  fakeFs.mkdir(folderName)

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        folderName,
        into: ''
      },
      errors: null
    }
  })

  const request = {
  }

  await route.didCreate(request as any, null, _nop)

  const expectedScope = {
    errors: ['A folder or file with this name already exists'],
    folderName,
    into: ''
  }

  t.is(render.calledWith(request, null, 'folder-create', expectedScope), true)
})

test('post create fail if folder already exists in a subdir', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const folderName = fakeFs.rndName()
  const intoName = fakeFs.rndName()
  const render = sinon.stub(route, 'render')
  fakeFs.mkdir(intoName)
  fakeFs.mkdir(path.join(intoName, folderName))

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        folderName,
        into: intoName
      },
      errors: null
    }
  })

  const request = {
  }

  await route.didCreate(request as any, null, _nop)

  const expectedScope = {
    errors: ['A folder or file with this name already exists'],
    folderName,
    into: intoName
  }

  t.is(render.calledWith(request, null, 'folder-create', expectedScope), true)
})
