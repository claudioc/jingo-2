import { config } from '@lib/config';
import test from 'ava';
import { cloneDeep as _clone } from 'lodash';
import fixers from '.';

test('fixDocumentRoot', t => {
  let value;
  let expected = '';
  let actual = fixers.fixDocumentRoot(value);
  t.is(actual, expected);

  value = '             ';
  expected = '';
  actual = fixers.fixDocumentRoot(value);
  t.is(actual, expected);

  value = '     test        ';
  expected = 'test';
  actual = fixers.fixDocumentRoot(value);
  t.is(actual, expected);

  value = 0;
  expected = '0';
  actual = fixers.fixDocumentRoot(value);
  t.is(actual, expected);
});

test('fixMountPath with undefined', t => {
  const value = undefined;
  const expected = '/';
  const actual = fixers.fixMountPath(value);
  t.is(actual, expected);
});

test('fixMountPath with empty string', t => {
  const value = '';
  const expected = '/';
  const actual = fixers.fixMountPath(value);
  t.is(actual, expected);
});

test('fixMountPath with slash', t => {
  const value = '/';
  const expected = '/';
  const actual = fixers.fixMountPath(value);
  t.is(actual, expected);
});

test('fixMountPath with string to trim', t => {
  const value = 'Buonasera   ';
  const expected = '/Buonasera/';
  const actual = fixers.fixMountPath(value);
  t.is(actual, expected);
});

test('fixMountPath with a number', t => {
  const value = 123;
  const expected = '/123/';
  const actual = fixers.fixMountPath(value as any);
  t.is(actual, expected);
});

test('fixWiki unset', t => {
  const expected = { index: 'Home', basePath: 'lol' };
  const actual = fixers.fixWiki(undefined, { index: 'Home', basePath: 'lol' });
  t.deepEqual(actual, expected as any);
});

test('fixWiki index unset', t => {
  const expected = { index: 'Home', basePath: 'lol' };
  const actual = fixers.fixWiki({} as any, { index: 'Home', basePath: 'lol' });
  t.deepEqual(actual, expected as any);
});

test('fixWiki basePath unset', t => {
  const expected = { index: 'Home', basePath: 'bzzt' };
  const actual = fixers.fixWiki({} as any, { index: 'Home', basePath: 'bzzt' });
  t.deepEqual(actual, expected as any);
});

test('fixWiki basePath with leading and trailing slashes', t => {
  const expected0 = { index: 'Home', basePath: 'tuo/nonno' };
  const actual0 = fixers.fixWiki(
    {
      basePath: '/tuo/nonno'
    } as any,
    { index: 'Home', basePath: 'bzzt' }
  );
  t.deepEqual(actual0, expected0 as any);

  const expected1 = { index: 'Home', basePath: 'tuo/nonno' };
  const actual1 = fixers.fixWiki(
    {
      basePath: '    /tuo/nonno//'
    } as any,
    { index: 'Home', basePath: 'bzzt' }
  );
  t.deepEqual(actual1, expected1 as any);
});

test('fixWiki basePath empty', t => {
  const expected0 = { index: 'Home', basePath: 'lol' };
  const actual0 = fixers.fixWiki(
    {
      basePath: '///   ///'
    } as any,
    { index: 'Home', basePath: 'lol' }
  );
  t.deepEqual(actual0, expected0 as any);
});

test('fixCustom when empty', t => {
  const expected = { scripts: [], styles: [], includes: [] };
  const actual = fixers.fixCustom(undefined, {});
  t.deepEqual(actual, expected);
});

test('fixCustom when one is empty', t => {
  const expected = { scripts: [], styles: [], includes: [] };
  const actual = fixers.fixCustom({ scripts: [] }, {});
  t.deepEqual(actual, expected);
});

test('fixCustom when content is wrong', t => {
  const expected = { scripts: ['foobar'], styles: ['123'], includes: ['gn'] };
  const actual = fixers.fixCustom({ scripts: 'foobar', styles: 123, includes: ['gn'] } as any, {});
  t.deepEqual(actual, expected);
});

test('fixFeatures use the defaults', async t => {
  const cfg = await config();
  const defaults = cfg.getDefault('features');
  const expected = defaults;
  const actual = fixers.fixFeatures(undefined, defaults);
  t.deepEqual(actual, expected);
});

test('fixFeatures codeHighlighter disabled', async t => {
  const cfg = await config();
  const defaults = cfg.getDefault('features');
  const expected = _clone(defaults);
  expected.codeHighlighter.enabled = false;
  const actual = fixers.fixFeatures(expected, defaults);
  t.deepEqual(actual, expected);
});

test('fixFeatures codeHighlighter broken', async t => {
  const cfg = await config();
  const defaults = cfg.getDefault('features');
  const expected = _clone(defaults);
  expected.codeHighlighter.enabled = '0';
  const actual = fixers.fixFeatures(expected, defaults);
  t.is(actual.codeHighlighter.enabled, true);
});

test('fixFeatures ipcSupport disabled', async t => {
  const cfg = await config();
  const defaults = cfg.getDefault('features');
  const expected = _clone(defaults);
  expected.ipcSupport.enabled = false;
  const actual = fixers.fixFeatures(expected, defaults);
  t.deepEqual(actual, expected);
});

test('fixFeatures ipcSupport broken', async t => {
  const cfg = await config();
  const defaults = cfg.getDefault('features');
  const expected = _clone(defaults);
  expected.ipcSupport.enabled = '0';
  expected.ipcSupport.server = 12;
  const actual = fixers.fixFeatures(expected, defaults);
  t.is(actual.ipcSupport.enabled, false);
  t.is(actual.ipcSupport.server, '12');
});
