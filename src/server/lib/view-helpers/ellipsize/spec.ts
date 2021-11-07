import test from 'ava';
import ellipsize from '.';

test('ellipsize with empty param', t => {
  const params = '';

  t.is(ellipsize(params), '');
});

test('ellipsize with short param', t => {
  const params = 'a';

  t.is(ellipsize(params), 'a');
});

test('ellipsize with medium param', t => {
  const params = '1234567890A';

  t.is(ellipsize(params), '12345…7890A');
});

test('ellipsize with a long param', t => {
  const params = '1234567890ABCDEFGHIJKLMN';

  t.is(ellipsize(params), '12345…JKLMN');
});
