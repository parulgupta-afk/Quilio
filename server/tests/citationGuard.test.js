const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildGroundedSources,
  parseSourceRefsFromAnswer,
  validateAnswerCitations,
} = require('../src/services/citationGuard');

describe('citationGuard', () => {
  const chunks = [
    { chunkIndex: 0, chunkText: 'Alpha trees', score: 0.9 },
    { chunkIndex: 2, chunkText: 'Beta graphs', score: 0.7 },
  ];

  it('parses one-based Source refs from answer text', () => {
    const refs = parseSourceRefsFromAnswer('See [Source 1] and [Source 2].');
    assert.deepEqual(refs, [1, 2]);
  });

  it('flags out-of-range citations', () => {
    const r = validateAnswerCitations('Claim [Source 9] is wrong', chunks);
    assert.equal(r.citationValid, false);
    assert.deepEqual(r.invalidCitations, [9]);
  });

  it('accepts valid citations', () => {
    const r = validateAnswerCitations('Based on [Source 1]', chunks);
    assert.equal(r.citationValid, true);
    assert.equal(r.sources.length, 1);
    assert.equal(r.sources[0].index, 1);
  });

  it('builds grounded sources', () => {
    assert.equal(buildGroundedSources(chunks).length, 2);
  });
});
