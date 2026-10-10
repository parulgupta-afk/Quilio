function buildGroundedSources(relevantChunks) {
  return (relevantChunks || []).map((c, i) => ({
    index: i + 1,
    chunkIndex: c.chunkIndex,
    snippet: String(c.chunkText || '').slice(0, 280),
    score: typeof c.score === 'number' ? Number(c.score.toFixed(4)) : undefined,
  }));
}
function filterModelSources(modelSources, allowedChunks) {
  const allowed = new Set((allowedChunks || []).map((c) => c.chunkIndex));
  if (!Array.isArray(modelSources) || !modelSources.length) return buildGroundedSources(allowedChunks);
  const filtered = modelSources.filter((s) => {
    const idx = s.chunkIndex ?? s.index;
    return allowed.has(idx) || allowed.has(Number(idx) - 1);
  });
  return filtered.length ? filtered : buildGroundedSources(allowedChunks);
}
module.exports = { buildGroundedSources, filterModelSources };
