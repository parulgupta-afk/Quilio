const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

let request;
let app;
try {
  request = require('supertest');
  app = require('../src/app');
} catch {
  request = null;
}

describe('GET /api/health', () => {
  it('returns json with status and database fields', async (t) => {
    if (!request) {
      t.skip('supertest not installed');
      return;
    }
    const res = await request(app).get('/api/health');
    assert.ok([200, 503].includes(res.status));
    assert.ok(res.body.status);
    assert.ok(res.body.database);
    assert.ok(res.body.timestamp);
  });
});
