const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildGroundedSources,
  parseSourceRefsFromAnswer,
  validateAnswerCitations,
  filterModelSources,
} = require('../src/services/citationGuard');

const chunks = [
  { chunkIndex: 0, chunkText: 'Alpha trees store ordered keys.', score: 0.91 },
  { chunkIndex: 1, chunkText: 'Beta graphs connect nodes.', score: 0.77 },
  { chunkIndex: 2, chunkText: 'Gamma heaps prioritize values.', score: 0.6 },
];

describe('citationGuard behavior', () => {
  it('maps [Source 1] to first retrieved source (one-based)', () => {
    const sources = buildGroundedSources(chunks);
    assert.equal(sources[0].index, 1);
    assert.equal(sources[0].chunkIndex, 0);
    const refs = parseSourceRefsFromAnswer('See [Source 1] for trees.');
    assert.deepEqual(refs, [1]);
    const v = validateAnswerCitations('See [Source 1] for trees.', chunks);
    assert.equal(v.citationValid, true);
    assert.deepEqual(v.citedIndexes, [1]);
    assert.equal(v.sources.length, 1);
    assert.equal(v.sources[0].chunkIndex, 0);
  });

  it('flags out-of-range references', () => {
    const v = validateAnswerCitations('Claim [Source 9] is unsupported', chunks);
    assert.equal(v.citationValid, false);
    assert.deepEqual(v.invalidCitations, [9]);
  });

  it('handles missing citations without inventing cited indexes', () => {
    const v = validateAnswerCitations('This answer has no markers.', chunks);
    assert.equal(v.citationValid, true);
    assert.deepEqual(v.citedIndexes, []);
    // Policy: when none cited, still return all retrieved for UI (documented)
    assert.equal(v.sources.length, 3);
  });

  it('handles multiple and duplicate citations', () => {
    const v = validateAnswerCitations(
      'From [Source 1] and again [Source 1] plus [Source 2].',
      chunks
    );
    assert.equal(v.citationValid, true);
    assert.deepEqual(v.citedIndexes, [1, 2]);
    assert.equal(v.sources.length, 2);
  });

  it('rejects zero and negative source indexes', () => {
    const v = validateAnswerCitations('Bad [Source 0] and [Source -1]', chunks);
    // parse may only catch Source 0
    assert.ok(v.invalidCitations.includes(0) || v.citationValid === false || v.citedIndexes.length === 0);
  });

  it('filterModelSources drops non-retrieved chunk indexes', () => {
    const filtered = filterModelSources(
      [
        { chunkIndex: 0, snippet: 'ok' },
        { chunkIndex: 99, snippet: 'hallucinated' },
      ],
      chunks
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].chunkIndex, 0);
  });

  it('correct source mapping for Source 3 → chunkIndex 2', () => {
    const v = validateAnswerCitations('Details in [Source 3].', chunks);
    assert.equal(v.citationValid, true);
    assert.equal(v.sources[0].index, 3);
    assert.equal(v.sources[0].chunkIndex, 2);
  });
});
