const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildGroundedSources, filterModelSources } = require('../src/services/citationGuard');

describe('citationGuard', () => {
  const chunks = [
    { chunkIndex: 0, chunkText: 'Alpha content about trees', score: 0.9 },
    { chunkIndex: 2, chunkText: 'Beta content about graphs', score: 0.7 },
  ];

  it('builds sources only from retrieved chunks', () => {
    const sources = buildGroundedSources(chunks);
    assert.equal(sources.length, 2);
    assert.equal(sources[0].chunkIndex, 0);
    assert.ok(sources[0].snippet.includes('Alpha'));
  });

  it('drops model sources that reference non-retrieved chunks', () => {
    const model = [
      { chunkIndex: 0, snippet: 'ok' },
      { chunkIndex: 99, snippet: 'hallucinated' },
    ];
    const filtered = filterModelSources(model, chunks);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].chunkIndex, 0);
  });

  it('falls back to grounded sources when model returns nothing usable', () => {
    const filtered = filterModelSources([{ chunkIndex: 50 }], chunks);
    assert.equal(filtered.length, 2);
  });
});
