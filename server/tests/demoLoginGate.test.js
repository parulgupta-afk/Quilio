const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

describe('demoLogin production gate', () => {
  const original = process.env.NODE_ENV;

  after(() => {
    process.env.NODE_ENV = original;
  });

  it('source controller blocks production (static check)', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.join(__dirname, '../src/controllers/authController.js'),
      'utf8'
    );
    assert.match(src, /NODE_ENV === ['"]production['"]/);
    assert.match(src, /Demo login is disabled in production/);
  });
});
