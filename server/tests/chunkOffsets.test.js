const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { chunkText } = require('../src/services/chunkText');

describe('chunkText offsets', () => {
  it('returns start/end offsets within cleaned text', () => {
    const text = 'First paragraph about trees.\n\nSecond paragraph about graphs.';
    const chunks = chunkText(text);
    assert.ok(chunks.length >= 1);
    const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    for (const c of chunks) {
      assert.equal(typeof c.startOffset, 'number');
      assert.equal(typeof c.endOffset, 'number');
      assert.ok(c.startOffset >= 0);
      assert.ok(c.endOffset > c.startOffset);
      assert.ok(c.endOffset <= cleaned.length);
      const slice = cleaned.slice(c.startOffset, c.endOffset);
      assert.ok(slice.includes(c.chunkText.slice(0, 10)) || c.chunkText.includes(slice.slice(0, 10)));
    }
  });

  it('returns empty for blank input', () => {
    assert.deepEqual(chunkText(''), []);
  });
});
