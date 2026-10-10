const logger = require('../utils/logger');

/**
 * Attach timing for expensive AI routes without logging bodies.
 */
function aiTiming(routeName) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      logger.info('ai_request', {
        route: routeName,
        status: res.statusCode,
        durationMs: Math.round(ms),
        userId: req.user?._id?.toString?.() || undefined,
      });
    });
    next();
  };
}

module.exports = { aiTiming };
