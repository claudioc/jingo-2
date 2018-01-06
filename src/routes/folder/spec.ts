import { config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import { nop as _nop } from 'lodash'
import * as path from 'path'
import * as sinon from 'sinon'
import Route from '.'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

test('get create route', async t => {
  const route = new Route(await config())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {}
  }
  await route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a folder')

  t.is(render.calledWith(request, null, 'folder-create'), true)
})

test('get create route fails with not existing into', async t => {
  const route = new Route(await config())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      into: 'foo/bazonga'
    }
  }

  await route.create(request as any, null, _nop)

  const expectedScope = {
    directory: 'foo/bazonga',
    folderName: 'bazonga',
    parentDirname: 'foo'
  }

  t.is(render.calledWith(request, null, 'folder-fail', expectedScope), true)
})

test('get create fails if folder already exists', async t => {
  const route = new Route(await fakeFs.config())
  const folderName = fakeFs.rndName()
  fakeFs.mkdir(folderName)

  const request = {
    query: {
      folderName
    }
  }

  const redirect = sinon.stub()
  const response = {
    redirect
  }

  await route.create(request as any, response as any, _nop)

  t.true(redirect.calledWith(`/wiki/${folderName}/`))
})

test('post create fails if folder already exists', async t => {
  const route = new Route(await fakeFs.config())
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
  const route = new Route(await fakeFs.config())
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

test('get rename route fails with 400 is no folderName passed', async t => {
  const route = new Route(await config())

  const request = {
    query: {
    }
  }

  const render = sinon.stub()
  const response = {
    status: sinon.stub().callsFake(() => {
      return {
        render
      }
    })
  }
  await route.rename(request as any, response as any, _nop)

  t.true(response.status.calledWith(400))
  t.true(response.status().render.calledWith('400'))
})

test('get rename route fails with not existing into', async t => {
  const route = new Route(await config())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      folderName: 'nausicaa',
      into: 'foo/bazonga'
    }
  }

  await route.rename(request as any, null, _nop)

  const expectedScope = {
    directory: 'foo/bazonga',
    folderName: 'bazonga',
    parentDirname: 'foo'
  }

  t.is(render.calledWith(request, null, 'folder-fail', expectedScope), true)
})

test('get delete route fails with 400 is no folderName passed', async t => {
  const route = new Route(await config())

  const request = {
    query: {
    }
  }

  const render = sinon.stub()
  const response = {
    status: sinon.stub().callsFake(() => {
      return {
        render
      }
    })
  }
  await route.delete(request as any, response as any, _nop)

  t.true(response.status.calledWith(400))
  t.true(response.status().render.calledWith('400'))
})

test('get delete route fails with not existing into', async t => {
  const route = new Route(await config())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      folderName: 'nausicaa',
      into: 'foo/bazonga'
    }
  }

  await route.delete(request as any, null, _nop)

  const expectedScope = {
    directory: 'foo/bazonga',
    folderName: 'bazonga',
    parentDirname: 'foo'
  }

  t.is(render.calledWith(request, null, 'folder-fail', expectedScope), true)
})
