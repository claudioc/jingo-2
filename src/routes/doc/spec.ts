import test from 'ava'
import { nop as _nop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

test('newDoc route receiving a name in the url', t => {
  const route = new Route()
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
      docName: 'hello_world'
    }
  }
  route.newDoc(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docName: 'hello_world',
    docTitle: 'hello world'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test('newDoc route not receiving a name in the url', t => {
  const route = new Route()
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
    }
  }
  route.newDoc(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docName: '',
    docTitle: 'new document'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test('createDoc success redirect to the wiki page', t => {
  const route = new Route()
  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'Winter in Berlin',
        docName: 'hello world'
      },
      errors: null
    }
  })

  const request = {
    query: {
      docName: 'hello world'
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  route.createDoc(request as any, response as any, _nop)

  t.is(redirect.calledWith('/wiki/hello_world'), true)
})

test('createDoc renders again with a validation error', t => {
  const route = new Route()
  const render = sinon.stub(route, 'render')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'blah',
        docName: 'My Name'
      },
      errors: 123
    }
  })

  const request = {
    query: {
      docName: 'hello world'
    }
  }

  route.createDoc(request as any, null, _nop)

  const expectedScope = {
    content: 'blah',
    docName: 'My Name',
    docTitle: 'My Name',
    errors: 123
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})
