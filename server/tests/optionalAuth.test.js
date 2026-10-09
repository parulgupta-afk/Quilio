const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { optionalAuth } = require('../src/middleware/auth');
const User = require('../src/models/User');

describe('optionalAuth middleware', () => {
  it('calls next and leaves req.user undefined when no authorization header is present', async () => {
    const req = { headers: {} };
    const res = {};
    let nextCalled = false;
    await optionalAuth(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.user, undefined);
  });

  it('calls next and leaves req.user undefined when token is malformed', async () => {
    const req = { headers: { authorization: 'Bearer invalid.token.value' } };
    const res = {};
    let nextCalled = false;
    await optionalAuth(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.user, undefined);
  });

  it('attaches user to req when valid token is present and user exists', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
    const fakeId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};

    // Mock User.findById
    const origFindById = User.findById;
    User.findById = (id) => ({
      select: (fields) => Promise.resolve({ _id: id, name: 'Test Scholar', email: 'test@quilio.app' }),
    });

    try {
      let nextCalled = false;
      await optionalAuth(req, res, () => {
        nextCalled = true;
      });
      assert.equal(nextCalled, true);
      assert.ok(req.user);
      assert.equal(req.user._id, fakeId);
      assert.equal(req.user.name, 'Test Scholar');
    } finally {
      User.findById = origFindById;
    }
  });
});
