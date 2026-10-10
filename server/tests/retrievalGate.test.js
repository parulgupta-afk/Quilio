const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
describe('RAG_MIN_SCORE', () => {
  it('is in range', () => {
    const s = Number(process.env.RAG_MIN_SCORE || 0.35);
    assert.ok(s >= 0 && s <= 1);
  });
});
