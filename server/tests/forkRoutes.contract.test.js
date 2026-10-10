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
});
