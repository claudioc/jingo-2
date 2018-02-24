import { config } from '@lib/config'
import test from 'ava'
import hasFeature from '.'

test('hasFeature with empty param', async t => {
  const helper = hasFeature(await config())
  const params = ''

  t.false(helper(params))
})

test('hasFeature with non-existant param', async t => {
  const helper = hasFeature(await config())
  const params = 'zombieKiller'

  t.false(helper(params))
})

test('hasFeature with existing param (false)', async t => {
  const helper = hasFeature(await config())
  const params = 'gitSupport'

  t.false(helper(params))
})

test('hasFeature with existing param (true)', async t => {
  const helper = hasFeature(await config())
  const params = 'codeHighlighter'

  t.true(helper(params))
})
