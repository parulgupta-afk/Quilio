const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildGroundedSources, filterModelSources } = require('../src/services/citationGuard');

describe('citationGuard', () => {
  const chunks = [
    { chunkIndex: 0, chunkText: 'Alpha trees', score: 0.9 },
    { chunkIndex: 2, chunkText: 'Beta graphs', score: 0.7 },
  ];
  it('builds grounded sources', () => {
    assert.equal(buildGroundedSources(chunks).length, 2);
  });
  it('filters hallucinated citations', () => {
    const f = filterModelSources([{ chunkIndex: 0 }, { chunkIndex: 99 }], chunks);
    assert.equal(f.length, 1);
  });
  it('fallback when none valid', () => {
    assert.equal(filterModelSources([{ chunkIndex: 50 }], chunks).length, 2);
  });
});
