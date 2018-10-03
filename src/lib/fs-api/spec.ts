import FakeFs from '@lib/fake-fs';
import test from 'ava';
import fsApi from '.';

const fakeFs = new FakeFs('/home/jingo');

test.after(() => {
  fakeFs.unmount();
});

test('scanDir on a not-existant direcotry', async t => {
  const options = {};
  const error = await t.throws(fsApi(fakeFs.fsDriver).scanDir('/home/jingos', options));
  t.regex(error.message, /ENOENT: no such/);
});

test('scanDir reports empty array on empty directory', async t => {
  const folderName = fakeFs.mkdirRnd();
  const actual = await fsApi(fakeFs.fsDriver).scanDir(`${fakeFs.mountPoint}/${folderName}`);
  const expected = [];
  t.deepEqual(actual, expected);
});

test('scanDir reports empty array on folder with only directories', async t => {
  const folderName = fakeFs.rndName();
  const folderName2 = fakeFs.rndName();
  const folderName3 = fakeFs.rndName();
  const folderName4 = fakeFs.rndName();
  fakeFs.mkdir(folderName);
  fakeFs.mkdir(`${folderName}/${folderName2}`);
  fakeFs.mkdir(`${folderName}/${folderName3}`);
  fakeFs.mkdir(`${folderName}/${folderName4}`);
  const actual = await fsApi(fakeFs.fsDriver).scanDir(`${fakeFs.mountPoint}/${folderName}`);
  const expected = [];
  t.deepEqual(actual, expected);
});

test('scanDir reports empty array on folder with only files', async t => {
  const folderName = fakeFs.rndName();
  const fileName1 = fakeFs.rndName();
  const fileName2 = fakeFs.rndName();
  const fileName3 = fakeFs.rndName();
  fakeFs.mkdir(folderName);
  fakeFs.writeFile(`${folderName}/${fileName1}`);
  fakeFs.writeFile(`${folderName}/${fileName2}`);
  fakeFs.writeFile(`${folderName}/${fileName3}`);
  const options = {
    includeFiles: false
  };
  const actual = await fsApi(fakeFs.fsDriver).scanDir(
    `${fakeFs.mountPoint}/${folderName}`,
    options
  );
  const expected = [];
  t.deepEqual(actual, expected);
});

test('scanDir reports only files', async t => {
  const folderName = fakeFs.rndName();
  const folderName2 = fakeFs.rndName();
  const folderName3 = fakeFs.rndName();
  const fileName1 = fakeFs.rndName();
  const fileName2 = fakeFs.rndName();
  const fileName3 = fakeFs.rndName();
  fakeFs.mkdir(folderName);
  fakeFs.mkdir(`${folderName}/${folderName2}`);
  fakeFs.mkdir(`${folderName}/${folderName3}`);
  fakeFs.writeFile(`${folderName}/${fileName1}`);
  fakeFs.writeFile(`${folderName}/${fileName2}`);
  fakeFs.writeFile(`${folderName}/${fileName3}`);
  const options = {
    includeFiles: true
  };
  const actual = await fsApi(fakeFs.fsDriver).scanDir(
    `${fakeFs.mountPoint}/${folderName}`,
    options
  );
  const expected = [fileName1, fileName2, fileName3].sort();
  t.deepEqual(actual, expected);
});

test('scanDir reports files and directories', async t => {
  const folderName = fakeFs.rndName();
  const folderName2 = fakeFs.rndName();
  const folderName3 = fakeFs.rndName();
  const fileName1 = fakeFs.rndName();
  const fileName2 = fakeFs.rndName();
  const fileName3 = fakeFs.rndName();
  fakeFs.mkdir(folderName);
  fakeFs.mkdir(`${folderName}/${folderName2}`);
  fakeFs.mkdir(`${folderName}/${folderName3}`);
  fakeFs.writeFile(`${folderName}/${fileName1}`);
  fakeFs.writeFile(`${folderName}/${fileName2}`);
  fakeFs.writeFile(`${folderName}/${fileName3}`);
  const options = {
    includeDirs: true,
    includeFiles: true
  };
  const actual = await fsApi(fakeFs.fsDriver).scanDir(
    `${fakeFs.mountPoint}/${folderName}`,
    options
  );
  const expected = [folderName2, folderName3, fileName1, fileName2, fileName3].sort();
  t.deepEqual(actual, expected);
});
