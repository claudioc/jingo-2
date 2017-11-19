import test from 'ava'
import { nop as _nop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

test('newDoc route receiving a name in the url', t => {
  const route = new Route()
  route.render = sinon.spy()

  const request = {
    params: {
      docName: 'hello_world'
    }
  }
  route.newDoc(request as any, null, _nop)
  const subject = route.render as any

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docName: 'hello_world',
    docTitle: 'hello world'
  }

  t.is(subject.calledWith(request, null, 'doc-new', expectedScope), true)
})

test('newDoc route not receiving a name in the url', t => {
  const route = new Route()
  route.render = sinon.spy()

  const request = {
    params: {
    }
  }
  route.newDoc(request as any, null, _nop)
  const subject = route.render as any

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docName: '',
    docTitle: 'new document'
  }

  t.is(subject.calledWith(request, null, 'doc-new', expectedScope), true)
})

// test('createDoc success redirect to the wiki page', t => {
//   const route = new Route()
//   route.render = sinon.spy()

//   const request = {
//     query: {
//       docName: 'hello world'
//     }
//   }

//   const response = {
//     redirect: sinon.spy()
//   }

//   route.createDoc(request as any, response as any, _nop)
//   const subject = response.redirect

//   t.is(subject.calledWith('/wiki/hello_world'), true)
// })
