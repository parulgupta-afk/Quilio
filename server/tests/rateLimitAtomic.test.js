const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('AI rate limit memory fallback', () => {
  it('enforces limit under sequential pressure', async () => {
    // Isolate memory map behavior without real Mongo
    let mongoose;
    try {
      mongoose = require('mongoose');
    } catch {
      // minimal stub so aiRateLimit can load
      const Module = require('module');
      const orig = Module.prototype.require;
      Module.prototype.require = function (id) {
        if (id === 'mongoose') {
          return {
            connection: { readyState: 0 },
            models: {},
            model: () => ({
              updateOne: async () => ({}),
              findOneAndUpdate: async () => null,
              findOne: async () => null,
            }),
            Schema: function Schema() {},
          };
        }
        return orig.apply(this, arguments);
      };
    }
    delete require.cache[require.resolve('../src/services/aiRateLimit')];
    const { checkAIRateLimit } = require('../src/services/aiRateLimit');
    const user = `test-user-${Date.now()}`;
    const limit = 5;
    let allowed = 0;
    for (let i = 0; i < 12; i++) {
      const ok = await checkAIRateLimit(user, limit);
      if (ok) allowed++;
    }
    assert.equal(allowed, limit);
  });
});
