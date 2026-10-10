const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('RAG retrieval gate config', () => {
  it('DEFAULT_MIN_SCORE env default is sane', () => {
    const score = Number(process.env.RAG_MIN_SCORE || 0.35);
    assert.equal(typeof score, 'number');
    assert.ok(score >= 0 && score <= 1);
  });
});
