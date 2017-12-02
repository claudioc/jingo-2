import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
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

test('docExists with a non-existant file', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)
  const expected = false
  const actual = await api(config).docExists('pappero_PI')
  t.is(actual, expected)
})

test('docExists with a existant file', async t => {
  const config = await configWithDefaults()
  setupMockFs(config)
  writeFile('pappero_PI', 'Hi!')
  const expected = true
  const actual = await api(config).docExists('pappero_PI')
  t.is(actual, expected)
})

test('loadDoc failure', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs)

  try {
    await api(config).loadDoc('pappero')
    t.fail()
  } catch (e) {
    t.pass()
  }
})

test('loadDoc success', async t => {
  const config = await configWithDefaults()
  setupMockFs(config)
  writeFile('pappero', 'Hi!')
  const actual = await api(config).loadDoc('pappero')
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('saveDoc success', async t => {
  const config = await configWithDefaults()
  setupMockFs(config)
  await api(config).saveDoc('pappero', 'Today is nöt yestarday')
  const actual = readFile('pappero')
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('renameDoc with the same name', async t => {
  const config = await configWithDefaults()
  const actual = await api(config).renameDoc('pappero', 'pappero')
  const expected = true
  t.is(actual, expected)
})

test('renameDoc with a different name', async t => {
  const config = await configWithDefaults()
  setupMockFs(config)
  writeFile('pappero_one', 'zot')
  let actual: any = await api(config).renameDoc('pappero_one', 'pappero_two')
  let expected: any = true
  t.is(actual, expected)

  actual = readFile('pappero_one')
  expected = null
  t.is(actual, expected)

  actual = readFile('pappero_two')
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists', async t => {
  const config = await configWithDefaults()
  setupMockFs(config)
  writeFile('pappero_one', 'zot')
  writeFile('pappero_due', 'zot')
  const actual: any = await api(config).renameDoc('pappero_one', 'pappero_two')
  const expected: any = false
  t.is(actual, expected)
})

const setupMockFs = (config: Config) => {
  config.setFs(myFs)
  config.set('documentRoot', mockBasePath)
}

const writeFile = (name, content) => {
  myFs.writeFileSync(path.join(mockBasePath, docFilenameFor(name)), content)
}

const readFile = (name) => {
  try {
    return myFs.readFileSync(path.join(mockBasePath, docFilenameFor(name))).toString()
  } catch (err) {
    return null
  }
}
