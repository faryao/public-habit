const assert = require('node:assert/strict');
const app = require('../assets/app.js');

assert.equal(app.isValidDateKey('2026-08-01'), true);
assert.equal(app.isValidDateKey('2026-02-30'), false);
assert.equal(app.isValidDateKey('01-08-2026'), false);

assert.equal(app.IDENTIFIER_PATTERN.test('morning-walk'), true);
assert.equal(app.IDENTIFIER_PATTERN.test('Morning Walk'), false);
assert.equal(app.IDENTIFIER_PATTERN.test('morning_walk'), false);

[-13, 0, 24319, 50000].forEach((index) => {
  assert.equal(app.toMonthIndex(app.fromMonthIndex(index)), index);
});

assert.match(app.proofTemplate('reading', '2026-08-01'), /habit: reading/);
assert.match(app.proofTemplate('reading', '2026-08-01'), /date: 2026-08-01/);

const url = new URL(app.newProofUrl('faryao/public-habit', 'morning-walk', '2026-08-01'));
assert.equal(url.pathname, '/faryao/public-habit/new/main/_proofs/morning-walk');
assert.equal(url.searchParams.get('filename'), '2026-08-01.md');
assert.match(url.searchParams.get('value'), /date: 2026-08-01/);

assert.equal(
  app.editUrl('faryao/public-habit', '_proofs/morning walk/2026-08-01.md'),
  'https://github.com/faryao/public-habit/edit/main/_proofs/morning%20walk/2026-08-01.md'
);

assert.equal(
  app.dateKeyInTimeZone('Europe/Dublin', new Date('2026-01-01T00:30:00Z')),
  '2026-01-01'
);

console.log('app.test.js: all checks passed');
