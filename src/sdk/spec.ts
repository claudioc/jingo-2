import { config } from '@lib/config'
import doc from '@lib/doc'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as path from 'path'
import sdk from '.'

const fakeFs = new FakeFs('/home/jingo')

const configUsingFakeFs = async () => {
  const cfg = await config(fakeFs.fsDriver)
  cfg.set('documentRoot', fakeFs.mountPoint)
  return cfg
}

test.after(() => {
  fakeFs.unmount()
})

test('docExists with a non-existant file', async t => {
  const cfg = await config()
  const docName = fakeFs.rndName()
  const expected = false
  const actual = await sdk(cfg).docExists(docName)
  t.is(actual, expected)
})

test('docExists with a existant file and no folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  fakeFs.writeFile(doc(cfg).docNameToFilename(docName), 'Hi!')
  const expected = true
  const actual = await sdk(cfg).docExists(docName)
  t.is(actual, expected)
})

test('docExists with a non-existant file in a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  const expected = false
  const actual = await sdk(cfg).docExists(docName, into)
  t.is(actual, expected)
})

test('docExists with a existant file in an existant folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  fakeFs.writeFile(path.join(into, doc(cfg).docNameToFilename(docName)))
  const expected = true
  const actual = await sdk(cfg).docExists(docName, into)
  t.is(actual, expected)
})

test('loadDoc failure', async t => {
  const cfg = await configUsingFakeFs()

  try {
    await sdk(cfg).loadDoc(fakeFs.rndName())
    t.fail()
  } catch (e) {
    t.pass()
  }
})

test('findDocTitle, case sensitive', async t => {
  const cfg = await configUsingFakeFs()
  const docName = 'any case'
  fakeFs.writeFile(doc(cfg).docNameToFilename('Any Case'), 'Hi!')

  const expected = 'any case'
  const actual = await sdk(cfg).findDocTitle(docName)
  t.is(actual, expected)
})

test('findDocTitle, case insensitive', async t => {
  const cfg = await configUsingFakeFs()
  cfg.sys.fileSystemIsCaseSensitive = false
  const docName = 'any case'
  fakeFs.writeFile(doc(cfg).docNameToFilename('Any Case'), 'Hi!')

  const expected = 'Any Case'
  const actual = await sdk(cfg).findDocTitle(docName)
  t.is(actual, expected)
})

test('loadDoc success', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  fakeFs.writeFile(doc(cfg).docNameToFilename(docName), 'Hi!')
  const actual = await sdk(cfg).loadDoc(docName)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('loadDoc success with a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const from = fakeFs.rndName()
  fakeFs.mkdir(from)
  fakeFs.writeFile(path.join(from, doc(cfg).docNameToFilename(docName)), 'Hi!')
  const actual = await sdk(cfg).loadDoc(docName, from)
  const expected = 'Hi!'
  t.is(actual.content, expected)
})

test('createDoc success', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  await sdk(cfg).createDoc(docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(doc(cfg).docNameToFilename(docName))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('createDoc success in a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  await sdk(cfg).createDoc(docName, 'Today is nöt yestarday', into)
  const actual = fakeFs.readFile(path.join(into, doc(cfg).docNameToFilename(docName)))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc success', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const docFilename = doc(cfg).docNameToFilename(docName)
  fakeFs.writeFile(docFilename, 'Hello')
  await sdk(cfg).updateDoc(docName, docName, 'Today is nöt yestarday')
  const actual = fakeFs.readFile(docFilename)
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc success in a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  const docFilename = doc(cfg).docNameToFilename(docName)
  fakeFs.writeFile(path.join(into, docFilename), 'Hello')
  await sdk(cfg).updateDoc(docName, docName, 'Today is nöt yestarday', into)
  const actual = fakeFs.readFile(path.join(into, docFilename))
  const expected = 'Today is nöt yestarday'
  t.is(actual, expected)
})

test('updateDoc failure', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const docFilename1 = doc(cfg).docNameToFilename(docName1)
  const docFilename2 = doc(cfg).docNameToFilename(docName2)
  fakeFs.writeFile(docFilename1, 'Hello')
    .writeFile(docFilename2, 'Hello')
  // This must fail because docName2 already exists
  const error = await t.throws(sdk(cfg).updateDoc(docName1, docName2, 'Today is nöt yestarday'))
  t.regex(error.message, /Cannot rename/)
})

test('renameDoc with the same name', async t => {
  const cfg = await config()
  const docName1 = fakeFs.rndName()
  const actual = await sdk(cfg).renameDoc(docName1, docName1)
  const expected = true
  t.is(actual, expected)
})

test('renameDoc with a different name', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(doc(cfg).docNameToFilename(docName1), 'zot')
  let actual: any = await sdk(cfg).renameDoc(docName1, docName2)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(cfg).docNameToFilename(docName1))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(doc(cfg).docNameToFilename(docName2))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name in a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const into = fakeFs.rndName()
  fakeFs.mkdir(into)
  const docFilename = doc(cfg).docNameToFilename(docName1)
  fakeFs.writeFile(path.join(into, docFilename), 'zot')
  let actual: any = await sdk(cfg).renameDoc(docName1, docName2, into)
  let expected: any = true
  t.is(actual, expected)

  actual = fakeFs.readFile(path.join(into, doc(cfg).docNameToFilename(docName1)))
  expected = null
  t.is(actual, expected)

  actual = fakeFs.readFile(path.join(into, doc(cfg).docNameToFilename(docName2)))
  expected = 'zot'
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(doc(cfg).docNameToFilename(docName1), 'zot')
    .writeFile(doc(cfg).docNameToFilename(docName2), 'zot')
  const actual: any = await sdk(cfg).renameDoc(docName1, docName2)
  const expected: any = false
  t.is(actual, expected)
})

test('renameDoc with a different name and new file already exists in a folder', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  const into = fakeFs.rndName()
  const docFilename1 = doc(cfg).docNameToFilename(docName1)
  const docFilename2 = doc(cfg).docNameToFilename(docName2)
  fakeFs.mkdir(into)
  fakeFs.writeFile(path.join(into, docFilename1), 'zot')
  fakeFs.writeFile(path.join(into, docFilename2), 'zot')
  const actual: any = await sdk(cfg).renameDoc(docName1, docName2, into)
  const expected: any = false
  t.is(actual, expected)
})

test('renameFolder with the same name', async t => {
  const cfg = await configUsingFakeFs()
  const folderName1 = fakeFs.rndName()
  const actual = await sdk(cfg).renameFolder(folderName1, folderName1)
  const expected = true
  t.is(actual, expected)
})

test('renameFolder with a different name', async t => {
  const cfg = await configUsingFakeFs()
  const folderName1 = fakeFs.rndName()
  const folderName2 = fakeFs.rndName()
  fakeFs.mkdir(folderName1)
  fakeFs.access(folderName1)
  const actual: any = await sdk(cfg).renameFolder(folderName1, folderName2)
  const error = t.throws(() => fakeFs.access(folderName1) as any)
  t.regex(error.message, /ENOENT: no such/)
  fakeFs.access(folderName2)

  const expected: any = true
  t.is(actual, expected)
})

test('listDocs in an existing subdir', async t => {
  const cfg = await configUsingFakeFs()
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.mkdir('mmh')
    .writeFile('mmh/' + doc(cfg).docNameToFilename(docName1), 'zot')
    .writeFile('mmh/' + doc(cfg).docNameToFilename(docName2), 'zot')
  const actual: any = await sdk(cfg).listDocs('mmh')
  const expected: any = [docName2, docName1].sort()
  t.deepEqual(actual, expected)
})

test('listDocs in a non-existing subdir', async t => {
  const cfg = await configUsingFakeFs()
  const error = await t.throws(sdk(cfg).listDocs('not-exists'))
  t.regex(error.message, /ENOENT: no such/)
})

test('renderToHtml', async t => {
  const cfg = await config()
  const expected = '<h1>foobar</h1>\n'
  const actual = sdk(cfg).renderToHtml('# foobar')
  t.is(actual, expected)
})
