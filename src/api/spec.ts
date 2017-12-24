import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import doc from '@lib/doc'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as path from 'path'
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

test('docExists with a existant file and no folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(doc(config).filenameFor(docName), 'Hi!')
  const expected = true
  const actual = await api(config).docExists(docName)
  t.is(actual, expected)
})

test('docExists with a non-existant file in a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  const expected = false
  const actual = await api(config).docExists(docName, into)
  t.is(actual, expected)
})

test('docExists with a existant file in an existant folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  fakeFs.writeFile(path.join(into, doc(config).filenameFor(docName)))
  const expected = true
  const actual = await api(config).docExists(docName, into)
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
  fakeFs.writeFile(doc(config).filenameFor(docName), 'Hi!')
  const actual = await api(config).loadDoc(docName)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('loadDoc success with a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const from = fakeFs.rndName()
  fakeFs.mkdir(from)
  fakeFs.writeFile(path.join(from, doc(config).filenameFor(docName)), 'Hi!')
  const actual = await api(config).loadDoc(docName, from)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('createDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  await api(config).createDoc(docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(doc(config).filenameFor(docName))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('createDoc success in a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  await api(config).createDoc(docName, 'Today is nöt yestarday', into)
  const actual = fakeFs.readFile(path.join(into, doc(config).filenameFor(docName)))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc success', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const docFilename = doc(config).filenameFor(docName)
  fakeFs.writeFile(docFilename, 'Hello')
  await api(config).updateDoc(docName, docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(docFilename)
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc success in a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  const docFilename = doc(config).filenameFor(docName)
  fakeFs.writeFile(path.join(into, docFilename), 'Hello')
  await api(config).updateDoc(docName, docName, 'Today is nöt yestarday', into)
  const actual = fakeFs.readFile(path.join(into, docFilename))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc failure', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const docFilename1 = doc(config).filenameFor(docName1)
  const docFilename2 = doc(config).filenameFor(docName2)
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
  fakeFs.writeFile(doc(config).filenameFor(docName1), 'zot')
  let actual: any = await api(config).renameDoc(docName1, docName2)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(config).filenameFor(docName1))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(config).filenameFor(docName2))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name in a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  const docFilename = doc(config).filenameFor(docName1)
  fakeFs.writeFile(path.join(into, docFilename), 'zot')
  let actual: any = await api(config).renameDoc(docName1, docName2, into)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(path.join(into, doc(config).filenameFor(docName1)))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(path.join(into, doc(config).filenameFor(docName2)))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(doc(config).filenameFor(docName1), 'zot')
    .writeFile(doc(config).filenameFor(docName2), 'zot')
  const actual: any = await api(config).renameDoc(docName1, docName2)
  const expected: any = false
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists in a folder', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const into = fakeFs.rndName()
  const docFilename1 = doc(config).filenameFor(docName1)
  const docFilename2 = doc(config).filenameFor(docName2)
  fakeFs.mkdir(into)
  fakeFs.writeFile(path.join(into, docFilename1), 'zot')
  fakeFs.writeFile(path.join(into, docFilename2), 'zot')
  const actual: any = await api(config).renameDoc(docName1, docName2, into)
  const expected: any = false
  t.is(actual, expected)
})

test('renameFolder with the same name', async t => {
  const config = await configWithDefaults()
  const folderName1 = fakeFs.rndName()
  const actual = await api(config).renameFolder(folderName1, folderName1)
  const expected = true
  t.is(actual, expected)
})

test('renameFolder with a different name', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const folderName1 = fakeFs.rndName()
  const folderName2 = fakeFs.rndName()
  fakeFs.mkdir(folderName1)
  fakeFs.access(folderName1)
  const actual: any = await api(config).renameFolder(folderName1, folderName2)
  const error = t.throws(() => fakeFs.access(folderName1) as any)
  t.regex(error.message, /ENOENT: no such/)
  fakeFs.access(folderName2)

  const expected: any = true
  t.is(actual, expected)
})

test('listDocs in an existing subdir', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.mkdir('mmh')
    .writeFile('mmh/' + doc(config).filenameFor(docName1), 'zot')
    .writeFile('mmh/' + doc(config).filenameFor(docName2), 'zot')
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
