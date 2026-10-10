/**
 * Integration: fork → edit → revision → restore via real Express routes + MongoDB.
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-integration';
process.env.NODE_ENV = 'test';

let request;
let app;
let mongoServer;
let available = true;
let skipReason = '';

before(async () => {
  try {
    request = require('supertest');
  } catch {
    available = false;
    skipReason = 'supertest not installed';
    return;
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    available = false;
    skipReason = `mongodb-memory-server unavailable: ${err.message}`;
    return;
  }

  // Require app after env is set
  delete require.cache[require.resolve('../src/app')];
  app = require('../src/app');
});

after(async () => {
  try {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  } catch (_) {}
  try {
    if (mongoServer) await mongoServer.stop();
  } catch (_) {}
});

async function register(name, email, password = 'password123') {
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  assert.equal(res.status, 201, `register failed: ${JSON.stringify(res.body)}`);
  assert.ok(res.body.token);
  return res.body;
}

describe('Fork / edit / restore integration', () => {
  it('full workflow + authorization failures', async (t) => {
    if (!available) {
      t.skip(skipReason);
      return;
    }

    const owner = await register('Owner User', `owner-${Date.now()}@example.com`);
    const other = await register('Other User', `other-${Date.now()}@example.com`);

    // Create original published post
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Original Learning Post',
        content: 'Version one content about binary trees and balance.',
        status: 'published',
        tags: ['algorithms'],
      });
    assert.equal(createRes.status, 201, JSON.stringify(createRes.body));
    const originalId = createRes.body._id;
    assert.ok(originalId);

    // Unauthenticated fork → 401
    const unauthFork = await request(app).post(`/api/posts/${originalId}/fork`);
    assert.equal(unauthFork.status, 401);

    // Other user forks published post → 201
    const forkRes = await request(app)
      .post(`/api/posts/${originalId}/fork`)
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(forkRes.status, 201, JSON.stringify(forkRes.body));
    assert.match(forkRes.body.title, /^Fork:/);
    assert.equal(String(forkRes.body.forkedFrom._id || forkRes.body.forkedFrom), String(originalId));
    assert.equal(String(forkRes.body.rootPost || forkRes.body.rootPost), String(originalId));
    const forkId = forkRes.body._id;

    // Owner cannot edit other's fork
    const stealEdit = await request(app)
      .put(`/api/posts/${forkId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ content: 'stolen' });
    assert.equal(stealEdit.status, 403);

    // Edit fork → creates revision snapshot of previous content
    const edit1 = await request(app)
      .put(`/api/posts/${forkId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({
        title: 'Fork: Original Learning Post',
        content: 'Version two content after first edit.',
        revisionNote: 'first edit',
      });
    assert.equal(edit1.status, 200, JSON.stringify(edit1.body));
    assert.equal(edit1.body.content, 'Version two content after first edit.');
    assert.ok((edit1.body.revisionCount || 0) >= 1);

    // Second edit
    const edit2 = await request(app)
      .put(`/api/posts/${forkId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ content: 'Version three content after second edit.' });
    assert.equal(edit2.status, 200);
    assert.equal(edit2.body.content, 'Version three content after second edit.');

    // List revisions (owner of fork)
    const revList = await request(app)
      .get(`/api/posts/${forkId}/revisions`)
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(revList.status, 200, JSON.stringify(revList.body));
    assert.ok(Array.isArray(revList.body.revisions));
    assert.ok(revList.body.revisions.length >= 1);

    // Non-owner cannot list revisions
    const revDenied = await request(app)
      .get(`/api/posts/${forkId}/revisions`)
      .set('Authorization', `Bearer ${owner.token}`);
    assert.equal(revDenied.status, 403);

    // Restore oldest-ish revision (last in sorted desc list may be first snapshot)
    const targetRevision = revList.body.revisions[revList.body.revisions.length - 1];
    assert.ok(targetRevision._id);

    const beforeRestoreContent = edit2.body.content;
    const restoreRes = await request(app)
      .post(`/api/posts/${forkId}/revisions/${targetRevision._id}/restore`)
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(restoreRes.status, 200, JSON.stringify(restoreRes.body));
    assert.equal(restoreRes.body.content, targetRevision.content);
    assert.notEqual(restoreRes.body.content, beforeRestoreContent);

    // Unauthorized restore
    const badRestore = await request(app)
      .post(`/api/posts/${forkId}/revisions/${targetRevision._id}/restore`)
      .set('Authorization', `Bearer ${owner.token}`);
    assert.equal(badRestore.status, 403);

    // Invalid revision id
    const fakeRev = await request(app)
      .post(`/api/posts/${forkId}/revisions/507f1f77bcf86cd799439011/restore`)
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(fakeRev.status, 404);

    // Missing post fork
    const missing = await request(app)
      .post('/api/posts/507f1f77bcf86cd799439011/fork')
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(missing.status, 404);

    // Reload fork from DB via GET by id/slug if possible — use my posts
    const mine = await request(app)
      .get('/api/posts/me/all')
      .set('Authorization', `Bearer ${other.token}`);
    assert.equal(mine.status, 200);
    const reloaded = (Array.isArray(mine.body) ? mine.body : []).find((p) => String(p._id) === String(forkId));
    assert.ok(reloaded);
    assert.equal(reloaded.content, targetRevision.content);
  });
});
