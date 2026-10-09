/**
 * Lightweight request validators (no Zod dependency).
 * Usage: router.post('/x', validate({ body: { title: 'string', content: 'string' } }), handler)
 */

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body?.[field];
      if (rule === 'string' || rule?.type === 'string') {
        const min = rule?.min ?? 1;
        if (!isNonEmptyString(value) || value.trim().length < min) {
          errors.push(`${field} is required${min > 1 ? ` (min ${min} chars)` : ''}`);
        }
      } else if (rule === 'email' || rule?.type === 'email') {
        if (!isNonEmptyString(value) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
      } else if (rule === 'optionalString') {
        if (value !== undefined && value !== null && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
      }
    }
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors, code: 'VALIDATION_ERROR' });
    }
    next();
  };
}

module.exports = { validateBody };
