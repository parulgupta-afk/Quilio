const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('fork lineage helpers', () => {
  it('rootPost is source when source has no root', () => {
    const source = { _id: 'A', rootPost: null };
    const rootId = source.rootPost || source._id;
    assert.equal(rootId, 'A');
  });

  it('rootPost propagates through chain', () => {
    const source = { _id: 'B', rootPost: 'A' };
    const rootId = source.rootPost || source._id;
    assert.equal(rootId, 'A');
  });

  it('fork title prefixes once', () => {
    const title = 'Intro to Trees';
    const forked = title.startsWith('Fork:') ? title : `Fork: ${title}`;
    assert.equal(forked, 'Fork: Intro to Trees');
    const again = forked.startsWith('Fork:') ? forked : `Fork: ${forked}`;
    assert.equal(again, 'Fork: Intro to Trees');
  });
});
