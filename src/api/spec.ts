import { configWithDefaults } from '@lib/config'
import test from 'ava'
import api from '.'

test('loadDoc failure', async t => {
  const config = await configWithDefaults()
  try {
    await api(config).loadDoc('pappero')
    t.fail()
  } catch (e) {
    t.pass()
  }
})

test('docExists', async t => {
  t.pass()
})
