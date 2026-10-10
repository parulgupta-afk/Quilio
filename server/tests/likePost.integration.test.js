/**
 * Integration: like / unlike post via real Express routes + MongoDB.
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

describe('Like and Unlike Post integration', () => {
  it('full like / unlike workflow with edge cases', async (t) => {
    if (!available) {
      t.skip(skipReason);
      return;
    }

    const authorUser = await register('Post Author', 'author_like_test@example.com');
    const readerUser = await register('Post Reader', 'reader_like_test@example.com');

    // Create a published post
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorUser.token}`)
      .send({
        title: 'Social Like Test Article',
        content: 'Article content testing likes and notifications.',
        tags: ['social', 'testing'],
        status: 'published',
      });
    assert.equal(postRes.status, 201);
    const postId = postRes.body._id;

    // 1. Unauthenticated request -> 401
    const unauthRes = await request(app).post(`/api/social/like/${postId}`);
    assert.equal(unauthRes.status, 401);

    // 2. Invalid post ID -> 400
    const invalidIdRes = await request(app)
      .post('/api/social/like/not-a-valid-id')
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(invalidIdRes.status, 400);
    assert.equal(invalidIdRes.body.message, 'Invalid post ID');

    // 3. Nonexistent post ID -> 404
    const fakeId = new mongoose.Types.ObjectId();
    const notFoundRes = await request(app)
      .post(`/api/social/like/${fakeId}`)
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.body.message, 'Post not found');

    // 4. Authenticated user successfully liking a post -> 200 { message: 'Post liked', liked: true }
    const likeRes = await request(app)
      .post(`/api/social/like/${postId}`)
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(likeRes.status, 200);
    assert.equal(likeRes.body.liked, true);
    assert.equal(likeRes.body.message, 'Post liked');

    // Verify post's likesCount incremented
    const Post = require('../src/models/Post');
    let postDoc = await Post.findById(postId);
    assert.equal(postDoc.likesCount, 1);

    // 5. The same user liking repeatedly -> 200 { message: 'Already liked', liked: true }, no double count
    const repeatLikeRes = await request(app)
      .post(`/api/social/like/${postId}`)
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(repeatLikeRes.status, 200);
    assert.equal(repeatLikeRes.body.liked, true);
    assert.equal(repeatLikeRes.body.message, 'Already liked');

    postDoc = await Post.findById(postId);
    assert.equal(postDoc.likesCount, 1);

    // 6. Unlike behavior -> 200 { message: 'Post unliked', liked: false }
    const unlikeRes = await request(app)
      .delete(`/api/social/like/${postId}`)
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(unlikeRes.status, 200);
    assert.equal(unlikeRes.body.liked, false);
    assert.equal(unlikeRes.body.message, 'Post unliked');

    postDoc = await Post.findById(postId);
    assert.equal(postDoc.likesCount, 0);

    // 7. Repeated unlike -> 200 { message: 'Post not liked', liked: false }
    const repeatUnlikeRes = await request(app)
      .delete(`/api/social/like/${postId}`)
      .set('Authorization', `Bearer ${readerUser.token}`);
    assert.equal(repeatUnlikeRes.status, 200);
    assert.equal(repeatUnlikeRes.body.liked, false);
    assert.equal(repeatUnlikeRes.body.message, 'Post not liked');

    // 8. Author liking own post (self-like shouldn't crash or throw notification error)
    const selfLikeRes = await request(app)
      .post(`/api/social/like/${postId}`)
      .set('Authorization', `Bearer ${authorUser.token}`);
    assert.equal(selfLikeRes.status, 200);
    assert.equal(selfLikeRes.body.liked, true);

    postDoc = await Post.findById(postId);
    assert.equal(postDoc.likesCount, 1);
  });
});
