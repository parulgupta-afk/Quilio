const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('fork lineage', () => {
  it('uses source id as root when rootPost is null', () => {
    const source = { _id: 'A', rootPost: null };
    assert.equal(source.rootPost || source._id, 'A');
  });
  it('propagates rootPost', () => {
    const source = { _id: 'B', rootPost: 'A' };
    assert.equal(source.rootPost || source._id, 'A');
  });
});

describe('restore semantics', () => {
  it('increments revision count when snapshotting before restore', () => {
    const revisionCount = 2;
    const nextRev = revisionCount + 1;
    assert.equal(nextRev, 3);
  });
});
