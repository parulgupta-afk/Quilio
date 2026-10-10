const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');

describe('demoLogin production gate', () => {
  const original = process.env.NODE_ENV;
  after(() => { process.env.NODE_ENV = original; });

  it('rejects demo-login when NODE_ENV is production (HTTP)', async (t) => {
    let request;
    try { request = require('supertest'); } catch { t.skip('supertest not installed'); return; }
    process.env.NODE_ENV = 'production';
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-secret-for-ci';
    const app = require('../src/app');
    const res = await request(app).post('/api/auth/demo-login').send({});
    assert.equal(res.status, 403);
  });
});
