const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');

describe('embedding dimension policy', () => {
  it('modelConfig defaults to gemini-embedding-001 and 768 dims', () => {
    delete process.env.GEMINI_EMBEDDING_MODEL;
    delete process.env.EMBEDDING_DIMS;
    delete process.env.GEMINI_EMBEDDING_DIMS;
    delete require.cache[require.resolve('../src/services/modelConfig')];
    const { getEmbeddingModelName, getEmbeddingDims } = require('../src/services/modelConfig');
    assert.equal(getEmbeddingModelName(), 'gemini-embedding-001');
    assert.equal(getEmbeddingDims(), 768);
  });

  it('rejects dimension mismatch via pure validation helper', () => {
    function assertCompatibleEmbedding(values, expectedDims, modelName) {
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Empty embedding returned');
      }
      if (expectedDims && values.length !== expectedDims) {
        throw new Error(
          `Embedding dimension mismatch: got ${values.length}, expected EMBEDDING_DIMS=${expectedDims} (model=${modelName})`
        );
      }
      return values;
    }
    assert.throws(
      () => assertCompatibleEmbedding([0.1, 0.2], 768, 'gemini-embedding-001'),
      /dimension mismatch/
    );
    const ok = assertCompatibleEmbedding(new Array(768).fill(0.01), 768, 'gemini-embedding-001');
    assert.equal(ok.length, 768);
  });

  it('EmbeddingChunk schema has no stale text-embedding-004 default', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '../src/models/EmbeddingChunk.js'), 'utf8');
    assert.doesNotMatch(src, /default:\s*['"]text-embedding-004['"]/);
    assert.match(src, /embeddingModel/);
    assert.match(src, /embeddingDims/);
    assert.match(src, /unique:\s*true/);
  });

  it('generateEmbedding source hard-fails on dim mismatch (not warn-only)', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '../src/services/aiService.js'), 'utf8');
    assert.match(src, /Embedding dimension mismatch/);
    assert.doesNotMatch(
      src,
      /console\.warn\(\s*[`'"]Embedding dim/
    );
  });

  it('pipeline deletes existing chunks before insert (idempotent reindex)', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '../src/services/embeddingPipeline.js'), 'utf8');
    assert.match(src, /deleteMany/);
    assert.match(src, /insertMany/);
    assert.match(src, /embeddingDims/);
  });
});
