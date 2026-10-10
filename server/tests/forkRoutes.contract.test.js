const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('fork API contract', () => {
  it('registers fork and restore routes', () => {
    const routes = fs.readFileSync(path.join(__dirname, '../src/routes/posts.js'), 'utf8');
    assert.match(routes, /\/:id\/fork/);
    assert.match(routes, /\/:id\/revisions/);
    assert.match(routes, /restore/);
  });

  it('controller exports forkPost and restoreRevision', () => {
    // Controllers pull mongoose — only check source text
    const ctrl = fs.readFileSync(path.join(__dirname, '../src/controllers/postController.js'), 'utf8');
    assert.match(ctrl, /const forkPost/);
    assert.match(ctrl, /const restoreRevision/);
    assert.match(ctrl, /Not authorized/);
  });

  it('client PostDetail defines handleFork in component scope', () => {
    const postDetail = fs.readFileSync(
      path.join(__dirname, '../../client/src/pages/PostDetail.jsx'),
      'utf8'
    );
    assert.match(postDetail, /const handleFork\s*=\s*async/);
    assert.match(postDetail, /api\.post\(`\/posts\/\$\{post\._id\}\/fork`\)/);
    assert.match(postDetail, /onClick=\{handleFork\}/);
    // Ensure handleFork is NOT inside if (loading)
    const loadingBlockMatch = postDetail.match(/if\s*\(loading\)\s*\{([^}]*)\}/);
    assert.ok(loadingBlockMatch);
    assert.doesNotMatch(loadingBlockMatch[1], /handleFork/);
  });
});

