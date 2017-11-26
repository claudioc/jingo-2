import test from 'ava'
import validators from '.'

test('checkDocumentRoot', t => {
  let error = t.throws(() => {
    let value
    validators.checkDocumentRoot(value)
  })

  t.regex(error.message, /The document root is empty/)

  error = t.throws(() => {
    let value = '/'
    validators.checkDocumentRoot(value)
  })

  t.regex(error.message, /EACCES The document root is not accessible/)
  error = t.throws(() => {
    let value = `${__dirname}/spec.js`
    validators.checkDocumentRoot(value)
  })

  t.regex(error.message, /EACCES The document root must be a directory/)

  error = t.notThrows(() => {
    let value = __dirname
    validators.checkDocumentRoot(value)
  })
})

test.todo('Check if the document root is an absolute path')
