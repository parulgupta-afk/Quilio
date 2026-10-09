const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createPost } = require('../src/controllers/postController');
const Post = require('../src/models/Post');

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

describe('Write / Post Creation Controller', () => {
  it('rejects post creation when title or content is missing', async () => {
    const req = {
      body: { title: 'Only title', content: '' },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = mockRes();

    await createPost(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Title and content are required');
  });

  it('creates post successfully with author, tags, and status', async () => {
    const authorId = '507f1f77bcf86cd799439011';
    const req = {
      body: {
        title: 'Mastering React and AI',
        content: 'Comprehensive walkthrough of writing apps with AI models.',
        tags: ['react', 'ai'],
        status: 'draft',
        coverImageUrl: 'https://example.com/cover.png',
      },
      user: { _id: authorId },
    };
    const res = mockRes();

    const origCreate = Post.create;
    const origFindById = Post.findById;

    const fakePost = {
      _id: 'post999',
      author: authorId,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      status: req.body.status,
      coverImageUrl: req.body.coverImageUrl,
    };

    Post.create = async (doc) => {
      assert.equal(doc.author, authorId);
      assert.equal(doc.title, 'Mastering React and AI');
      assert.equal(doc.tags.length, 2);
      return fakePost;
    };

    Post.findById = () => ({
      populate: () => Promise.resolve({
        ...fakePost,
        author: { _id: authorId, name: 'Scholar Aria', avatarUrl: '' },
      }),
    });

    try {
      await createPost(req, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.title, 'Mastering React and AI');
      assert.equal(res.body.author.name, 'Scholar Aria');
    } finally {
      Post.create = origCreate;
      Post.findById = origFindById;
    }
  });
});
