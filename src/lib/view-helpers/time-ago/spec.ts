import test from 'ava'
import timeAgo from '.'

test('timeAgo with recent time', t => {
  const params = new Date()

  t.true(timeAgo(params).endsWith(' ago'))
})
