import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import doc from '@lib/doc'
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
  fakeFs.writeFile(doc(config).docFilenameFor(docName), 'Hi!')
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
  fakeFs.writeFile(doc(config).docFilenameFor(docName), 'Hi!')
  const actual = await api(config).loadDoc(docName)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('createDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  await api(config).createDoc(docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(doc(config).docFilenameFor(docName))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const docFilename = doc(config).docFilenameFor(docName)
  fakeFs.writeFile(docFilename, 'Hello')
  await api(config).updateDoc(docName, docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(docFilename)
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc failure', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const docFilename1 = doc(config).docFilenameFor(docName1)
  const docFilename2 = doc(config).docFilenameFor(docName2)
  fakeFs.writeFile(docFilename1, 'Hello')
    .writeFile(docFilename2, 'Hello')
  // This must fail because docName2 already exists
  const error = await t.throws(api(config).updateDoc(docName1, docName2, 'Today is nöt yestarday'))
  t.regex(error.message, /Cannot rename/)
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
  fakeFs.writeFile(doc(config).docFilenameFor(docName1), 'zot')
  let actual: any = await api(config).renameDoc(docName1, docName2)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(config).docFilenameFor(docName1))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(config).docFilenameFor(docName2))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(doc(config).docFilenameFor(docName1), 'zot')
    .writeFile(doc(config).docFilenameFor(docName2), 'zot')
  const actual: any = await api(config).renameDoc(docName1, docName2)
  const expected: any = false
  t.is(actual, expected)
})

test('listDocs in an existing subdir', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.mkdir('mmh')
    .writeFile('mmh/' + doc(config).docFilenameFor(docName1), 'zot')
    .writeFile('mmh/' + doc(config).docFilenameFor(docName2), 'zot')
  const actual: any = await api(config).listDocs('mmh')
  const expected: any = [docName2, docName1].sort()
  t.deepEqual(actual, expected)
})

test('listDocs in a non-existing subdir', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const error = await t.throws(api(config).listDocs('not-exists'))
  t.regex(error.message, /ENOENT: no such/)
})
