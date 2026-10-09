const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateBody } = require('../src/middleware/validate');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

describe('validateBody', () => {
  it('rejects missing email on login-shaped rules', () => {
    const mw = validateBody({ email: 'email', password: 'string' });
    const req = { body: { password: 'secret1' } };
    const res = mockRes();
    let nextCalled = false;
    mw(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
  });

  it('rejects short password when min is 6', () => {
    const mw = validateBody({
      name: 'string',
      email: 'email',
      password: { type: 'string', min: 6 },
    });
    const req = { body: { name: 'A', email: 'a@b.com', password: '123' } };
    const res = mockRes();
    let nextCalled = false;
    mw(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
  });

  it('calls next when body is valid', () => {
    const mw = validateBody({ email: 'email', password: 'string' });
    const req = { body: { email: 'user@quilio.app', password: 'demo1234' } };
    const res = mockRes();
    let nextCalled = false;
    mw(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });
});
