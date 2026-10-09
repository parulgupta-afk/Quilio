const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { search } = require('../src/controllers/searchController');
const Post = require('../src/models/Post');
const User = require('../src/models/User');

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

describe('Search Controller', () => {
  it('returns 400 when search query is missing or whitespace only', async () => {
    const req = { query: { q: '   ' } };
    const res = mockRes();

    await search(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    assert.equal(res.body.message, 'Search query is required');
  });

  it('returns 400 when search query exceeds 120 characters', async () => {
    const req = { query: { q: 'a'.repeat(125) } };
    const res = mockRes();

    await search(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    assert.equal(res.body.message, 'Query too long');
  });

  it('performs query and returns matched posts and users', async () => {
    const req = { query: { q: 'javascript' } };
    const res = mockRes();

    const origPostFind = Post.find;
    const origUserFind = User.find;

    const mockPosts = [
      {
        _id: 'post1',
        title: 'Modern JavaScript Guide',
        content: 'Deep dive into JS',
        status: 'published',
        tags: ['javascript', 'web'],
        author: { name: 'Aria' },
      },
    ];

    const mockUsers = [
      {
        _id: 'user1',
        name: 'JS Master',
        bio: 'JavaScript Enthusiast',
        followersCount: 42,
      },
    ];

    // Mock text search throwing to trigger fallback regex query
    let postQueryCalled = false;
    Post.find = (filter) => {
      postQueryCalled = true;
      return {
        populate: () => ({
          sort: () => ({
            limit: () => Promise.resolve(mockPosts),
          }),
        }),
      };
    };

    User.find = (filter) => ({
      select: () => ({
        limit: () => Promise.resolve(mockUsers),
      }),
    });

    try {
      await search(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(postQueryCalled, true);
      assert.equal(res.body.query, 'javascript');
      assert.equal(res.body.posts.length, 1);
      assert.equal(res.body.posts[0].title, 'Modern JavaScript Guide');
      assert.equal(res.body.users.length, 1);
      assert.equal(res.body.users[0].name, 'JS Master');
    } finally {
      Post.find = origPostFind;
      User.find = origUserFind;
    }
  });
});
