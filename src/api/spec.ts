import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import { docFilenameFor } from '@lib/doc'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import api from '.'

const fakeFs = new FakeFs('/home/jingo')

const useFakeFs = (config: Config) => {
  config.setFs(fakeFs.theFs).set('documentRoot', fakeFs.mountPoint)
}

test.after(() => {
  fakeFs.unmount()
})

test('docExists with a non-existant file', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const expected = false
  const actual = await api(config).docExists(docName)
  t.is(actual, expected)
})

test('docExists with a existant file', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(docFilenameFor(docName), 'Hi!')
  const expected = true
  const actual = await api(config).docExists(docName)
  t.is(actual, expected)
})

test('loadDoc failure', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)

  try {
    await api(config).loadDoc(fakeFs.rndName())
    t.fail()
  } catch (e) {
    t.pass()
  }
})

test('loadDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(docFilenameFor(docName), 'Hi!')
  const actual = await api(config).loadDoc(docName)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('saveDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  await api(config).saveDoc(docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(docFilenameFor(docName))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('renameDoc with the same name', async t => {
  const config = await configWithDefaults()
  const docName1 = fakeFs.rndName()
  const actual = await api(config).renameDoc(docName1, docName1)
  const expected = true
  t.is(actual, expected)
})

test('renameDoc with a different name', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(docFilenameFor(docName1), 'zot')
  let actual: any = await api(config).renameDoc(docName1, docName2)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(docFilenameFor(docName1))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(docFilenameFor(docName2))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(docFilenameFor(docName1), 'zot')
  fakeFs.writeFile(docFilenameFor(docName2), 'zot')
  const actual: any = await api(config).renameDoc(docName1, docName2)
  const expected: any = false
  t.is(actual, expected)
})
