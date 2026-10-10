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

async function checkAIRateLimit(userId, limit = Number(process.env.AI_DAILY_LIMIT || 40)) {
  const key = `ai:${userId}`;
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  try {
    if (mongoose.connection.readyState !== 1) return memoryCheck(key, limit, dayMs);
    let doc = await AIUsage.findOne({ key });
    if (!doc || doc.resetAt <= now) {
      await AIUsage.findOneAndUpdate(
        { key },
        { count: 1, resetAt: new Date(now.getTime() + dayMs) },
        { upsert: true, new: true }
      );
      return true;
    }
    if (doc.count >= limit) return false;
    doc.count += 1;
    await doc.save();
    return true;
  } catch (err) {
    console.error('AI rate limit error:', err.message);
    return memoryCheck(key, limit, dayMs);
  }
}

function memoryCheck(key, limit, dayMs) {
  const now = Date.now();
  let usage = memoryFallback.get(key);
  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + dayMs };
    memoryFallback.set(key, usage);
  }
  if (usage.count >= limit) return false;
  usage.count += 1;
  return true;
}

module.exports = { checkAIRateLimit };
