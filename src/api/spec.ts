import test from 'ava'
import api from '.'

test('loadDoc failure', async t => {
  try {
    await api.loadDoc('pappero')
    t.fail()
  } catch (e) {
    t.pass()
  }
})
