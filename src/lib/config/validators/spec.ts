import { configWithDefaults } from '@lib/config'
import test from 'ava'
import validators from '.'

test('checkDocumentRoot fails when document root is empty', async t => {
  const config = await configWithDefaults()
  const error = await t.throws(validators.checkDocumentRoot(config, undefined))
  t.regex(error.message, /The document root is empty/)
})

test('checkDocumentRoot fails if the document root is not writable', async t => {
  const config = await configWithDefaults()
  const value = '/'
  const error = await t.throws(validators.checkDocumentRoot(config, value))
  t.regex(error.message, /EACCES The document root is not accessible/)
})

test('checkDocumentRoot fails if the document root is not a directory', async t => {
  const config = await configWithDefaults()
  const value = `${__dirname}/spec.js`
  const error = await t.throws(validators.checkDocumentRoot(config, value))
  t.regex(error.message, /EACCES The document root must be a directory/)
})

test('checkDocumentRoot success on a readable directory', async t => {
  const config = await configWithDefaults()
  const value = __dirname
  await t.notThrows(validators.checkDocumentRoot(config, value))
})

test.todo('Check if the document root is an absolute path')
