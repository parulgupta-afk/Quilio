const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const AIUsage = mongoose.models.AIUsage || mongoose.model('AIUsage', usageSchema);
const memoryFallback = new Map();

/**
 * Atomic-ish daily counter using findOneAndUpdate.
 * Reset window: if resetAt is in the past, reset count to 1.
 */
async function checkAIRateLimit(userId, limit = Number(process.env.AI_DAILY_LIMIT || 40)) {
  if (!userId) return false;
  const key = `ai:${String(userId)}`;
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const nextReset = new Date(now.getTime() + dayMs);

  try {
    if (mongoose.connection.readyState !== 1) {
      return memoryCheck(key, limit, dayMs);
    }

    // Reset expired windows first
    await AIUsage.updateOne(
      { key, resetAt: { $lte: now } },
      { $set: { count: 0, resetAt: nextReset } }
    );

    // Atomic increment only while under limit
    const updated = await AIUsage.findOneAndUpdate(
      {
        key,
        $or: [{ count: { $lt: limit } }, { count: { $exists: false } }],
      },
      {
        $inc: { count: 1 },
        $setOnInsert: { resetAt: nextReset },
      },
      { upsert: true, new: true }
    );

    if (!updated) {
      // Document exists but at/over limit
      const current = await AIUsage.findOne({ key });
      if (!current || current.count >= limit) return false;
      // Race: try once more
      const retry = await AIUsage.findOneAndUpdate(
        { key, count: { $lt: limit } },
        { $inc: { count: 1 } },
        { new: true }
      );
      return !!retry;
    }

    // Upsert may create with count 1 — if somehow over, reject
    if (updated.count > limit) return false;
    return true;
  } catch (err) {
    console.error('AI rate limit error:', err.message);
    return memoryCheck(key, limit, dayMs);
  }
}

function memoryCheck(key, limit, dayMs) {
  const now = Date.now();
  let u = memoryFallback.get(key);
  if (!u || now > u.resetAt) {
    u = { count: 0, resetAt: now + dayMs };
    memoryFallback.set(key, u);
  }
  if (u.count >= limit) return false;
  u.count += 1;
  return true;
}

module.exports = { checkAIRateLimit };
