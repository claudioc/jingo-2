import { configWithDefaults } from '@lib/config'
import { docFilenameFor } from '@lib/doc'
import test from 'ava'
import * as path from 'path'
import api from '.'

import * as fs from 'fs'
const memfs = require('memfs')
import * as MountFs from 'mountfs'

const mockBasePath = '/home/jingo'

const myFs = new MountFs(fs)
myFs.mount(mockBasePath, memfs)

test.after(() => {
  myFs.unmount(mockBasePath)
})

test.serial('docExists with a non-existant file', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)
  const expected = false
  const actual = await api(config).docExists('pappero_PI')
  t.is(actual, expected)
})

test.serial('docExists with a existant file', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs).set('documentRoot', mockBasePath)
  myFs.writeFileSync(path.join(mockBasePath, docFilenameFor('pappero_PI')), 'Hi')
  const expected = true
  const actual = await api(config).docExists('pappero_PI')
  t.is(actual, expected)
})

test.serial('loadDoc failure', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)

  try {
    await api(config).loadDoc('pappero')
    t.fail()
  } catch (e) {
    t.pass()
  }
})

test.serial('loadDoc success', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)
  config.set('documentRoot', mockBasePath)
  myFs.writeFileSync(path.join(mockBasePath, docFilenameFor('pappero')), 'Hi!')
  const actual = await api(config).loadDoc('pappero')
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test.serial('saveDoc success', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)
  config.set('documentRoot', mockBasePath)
  await api(config).saveDoc('pappero', 'Today is nöt yestarday')
  const actual = myFs.readFileSync(path.join(mockBasePath, docFilenameFor('pappero'))).toString()
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})
