const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { isOriginAllowed, getAllowedOrigins } = require('../src/config/cors');

describe('CORS and Socket Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.CLIENT_URL;
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('allows production Vercel origin by default', () => {
    assert.equal(isOriginAllowed('https://quilio-olive.vercel.app'), true);
    assert.equal(isOriginAllowed('https://quilio-olive.vercel.app/'), true);
  });

  it('allows localhost development origins by default', () => {
    assert.equal(isOriginAllowed('http://localhost:5173'), true);
    assert.equal(isOriginAllowed('http://localhost:3000'), true);
    assert.equal(isOriginAllowed('http://127.0.0.1:5173'), true);
    assert.equal(isOriginAllowed('http://127.0.0.1:3000'), true);
  });

  it('allows null or undefined origins for non-browser requests', () => {
    assert.equal(isOriginAllowed(null), true);
    assert.equal(isOriginAllowed(undefined), true);
    assert.equal(isOriginAllowed(''), true);
  });

  it('allows Vercel preview deployments matching quilio prefix', () => {
    assert.equal(isOriginAllowed('https://quilio-preview.vercel.app'), true);
    assert.equal(isOriginAllowed('https://quilio-git-feat.vercel.app'), true);
  });

  it('rejects unauthorized foreign origins', () => {
    assert.equal(isOriginAllowed('https://evil-attacker.com'), false);
    assert.equal(isOriginAllowed('https://quilio-olive.vercel.app.attacker.com'), false);
    assert.equal(isOriginAllowed('https://unrelated-project.vercel.app'), false);
  });

  it('dynamically respects CLIENT_URL and CORS_ORIGIN environment variables', () => {
    process.env.CLIENT_URL = 'https://custom-client.com/';
    process.env.CORS_ORIGIN = 'https://custom-origin-1.com, https://custom-origin-2.com/';

    assert.equal(isOriginAllowed('https://custom-client.com'), true);
    assert.equal(isOriginAllowed('https://custom-client.com/'), true);
    assert.equal(isOriginAllowed('https://custom-origin-1.com'), true);
    assert.equal(isOriginAllowed('https://custom-origin-2.com'), true);
  });

  it('server attaches Socket.io to the HTTP server with CORS credentials', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../src/server.js'), 'utf8');
    assert.match(serverCode, /new Server\(server,/);
    assert.match(serverCode, /path:\s*['"]\/socket\.io['"]/);
    assert.match(serverCode, /isOriginAllowed\(origin\)/);
    assert.match(serverCode, /credentials:\s*true/);
  });

  it('app configures Express CORS and OPTIONS preflight handler', () => {
    const appCode = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
    assert.match(appCode, /app\.use\(cors\(corsOptions\)\)/);
    assert.match(appCode, /app\.options\('\*', cors\(corsOptions\)\)/);
  });

  it('client socket service never defaults to frontend origin in production', () => {
    const socketCode = fs.readFileSync(path.join(__dirname, '../../client/src/services/socket.js'), 'utf8');
    assert.doesNotMatch(socketCode, /io\([^)]*\|\|\s*['"]\/['"]\)/);
    assert.match(socketCode, /quilio\.onrender\.com/);
    assert.match(socketCode, /getSocketUrl/);
    assert.match(socketCode, /replace\(\/\\\/api\$\/,\s*['"]['"]\)/);
  });

  it('client api service correctly handles VITE_API_URL and dev fallback', () => {
    const apiCode = fs.readFileSync(path.join(__dirname, '../../client/src/services/api.js'), 'utf8');
    assert.match(apiCode, /getApiBaseUrl/);
    assert.match(apiCode, /quilio\.onrender\.com\/api/);
  });
});
