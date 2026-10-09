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

describe('Auth validation (HTTP)', () => {
  it('POST /api/auth/login without body → 400', async (t) => {
    if (!request) {
      t.skip('supertest not installed');
      return;
    }
    const res = await request(app).post('/api/auth/login').send({});
    assert.equal(res.status, 400);
  });

  it('POST /api/auth/register with invalid email → 400', async (t) => {
    if (!request) {
      t.skip('supertest not installed');
      return;
    }
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'bad', password: '123456' });
    assert.equal(res.status, 400);
  });
});
