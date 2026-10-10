const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('realtime notification wiring', () => {
  it('server authenticates sockets with JWT and joins user room', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/server.js'), 'utf8');
    assert.match(src, /jwt\.verify/);
    assert.match(src, /socket\.join\(`user:\$\{socket\.userId\}`\)/);
    assert.match(src, /handshake\.auth/);
  });

  it('createNotification emits to user room', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/utils/createNotification.js'), 'utf8');
    assert.match(src, /Notification\.create/);
    assert.match(src, /global\.io\.to\(`user:\$\{recipient/);
    assert.match(src, /\.emit\('notification'/);
  });

  it('social controller obtains io from app', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/controllers/socialController.js'), 'utf8');
    assert.match(src, /req\.app\.get\('io'\)/);
    assert.match(src, /createNotification/);
  });

  it('client Layout listens for notification events', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../client/src/components/Layout.jsx'), 'utf8');
    assert.match(src, /connectSocket/);
    assert.match(src, /\.on\?\.\('notification'/);
  });
});
