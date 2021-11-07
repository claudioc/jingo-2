import test from 'ava';
import userCan from '.';

test('userCan returns true if the user is not present', t => {
  const options = {
    data: { root: {} }
  };

  t.false(userCan('editDocuments', options));
});

test('userCan returns true if the user is present and has the permission', t => {
  const options = {
    data: {
      root: {
        user: {
          permissions: ['passTests'],
          username: 'someone'
        }
      }
    }
  };

  t.true(userCan('passTests', options));
});

test('userCan returns false if the user is present and does not have the permission', t => {
  const options = {
    data: {
      root: {
        user: {
          permissions: ['DoesNotPassTests'],
          username: 'someone'
        }
      }
    }
  };

  t.false(userCan('passTests', options));
});
