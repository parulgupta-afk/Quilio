const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const logger = require('../src/utils/logger');

describe('logger', () => {
  it('exports info/warn/error without throwing', () => {
    assert.equal(typeof logger.info, 'function');
    logger.info('test_event', { password: 'secret', ok: true });
  });
});
