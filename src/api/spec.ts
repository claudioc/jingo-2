// import test from 'ava'
// test.todo('Zot!')
import { configWithDefaults } from '@lib/config'
import test from 'ava'
import * as fs from 'fs-extra'
const memfs = require('memfs')
import * as MountFs from 'mountfs'
import * as sinon from 'sinon'

MountFs.patchInPlace( fs )

;(fs as any).mount('/home/jingo', memfs)

// import api from '.'

test.afterEach(() => {
  ;(fs as any).unmount('/home/jingo')
})

test('loadDoc failure', async t => {
  // Other options: custom require() or use sinon to mock the single call?

  const readFile = sinon.stub(fs, 'readFile').callsFake(filename => {
    return new Promise((resolve, reject) => {
      resolve('ANTANI')
    })
  })

  const configFilename = '/home/jingo/config.json'
  await fs.writeFile(configFilename, 'antani')
  console.log(await fs.readFile(configFilename).toString())
  const config = await configWithDefaults(configFilename)
  config.set('documentRoot', '/home/jingo')
  console.log(config)
  readFile.restore()
  t.pass()
})

// test('docExists with a non-existant file', async t => {
//   const config = await configWithDefaults()
//   const expected = false
//   const actual = await api(config).docExists('pappero')
//   t.is(actual, expected)
// })

// const fs = require('mock-fs')

// test.afterEach(() => {
//   fs.restore()
// })

// test('loadDoc failure', async t => {
//   const config = await configWithDefaults()

//   fs()
//   try {
//     await api(config).loadDoc('pappero')
//     t.fail()
//   } catch (e) {
//     t.pass()
//   }
// })

// test('docExists with a non-existant file', async t => {
//   const config = await configWithDefaults()
//   fs()
//   const expected = false
//   const actual = await api(config).docExists('pappero')
//   t.is(actual, expected)
// })

// test('docExists with a existant file', async t => {
//   const config = await configWithDefaults()
//   config.set('documentRoot', '/tmp')
//   fs({
//     '/tmp/bazinga': 'some content'
//   })
//   const expected = true
//   const actual = await api(config).docExists('bazinga')
//   t.is(actual, expected)
// })
