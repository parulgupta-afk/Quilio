const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');

describe('Gemini model config', () => {
  const keys = ['GEMINI_CHAT_MODEL', 'GEMINI_EMBEDDING_MODEL', 'GEMINI_MODEL', 'GEMINI_WRITING_MODEL'];
  const saved = {};
  after(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('defaults to post-shutdown-safe model ids', () => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    delete require.cache[require.resolve('../src/services/modelConfig')];
    const { getChatModelName, getEmbeddingModelName } = require('../src/services/modelConfig');
    assert.equal(getChatModelName(), 'gemini-3.6-flash');
    assert.equal(getEmbeddingModelName(), 'gemini-embedding-001');
  });

  it('respects env overrides', () => {
    process.env.GEMINI_CHAT_MODEL = 'gemini-3.8-flash';
    process.env.GEMINI_EMBEDDING_MODEL = 'gemini-embedding-2';
    delete require.cache[require.resolve('../src/services/modelConfig')];
    const { getChatModelName, getEmbeddingModelName } = require('../src/services/modelConfig');
    assert.equal(getChatModelName(), 'gemini-3.8-flash');
    assert.equal(getEmbeddingModelName(), 'gemini-embedding-2');
  });
});
