/**
 * Source indexing convention (must match chatWithPost prompt):
 * [Source 1] → sources[0] (one-based labels in model text)
 */

function buildGroundedSources(relevantChunks) {
  return (relevantChunks || []).map((c, i) => ({
    index: i + 1,
    chunkIndex: c.chunkIndex,
    snippet: String(c.chunkText || '').slice(0, 280),
    score: typeof c.score === 'number' ? Number(c.score.toFixed(4)) : undefined,
  }));
}

function parseSourceRefsFromAnswer(answerText) {
  const text = String(answerText || '');
  const refs = new Set();
  const re = /\[Source\s+(\d+)\]/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    refs.add(Number(m[1]));
  }
  return [...refs].sort((a, b) => a - b);
}

/**
 * Validate model answer citations against retrieved sources.
 * Invalid refs are listed; sources returned are only those cited + valid.
 * Invalid citation markers are left in text but flagged (we do not rewrite claims).
 */
function validateAnswerCitations(answerText, relevantChunks) {
  const sources = buildGroundedSources(relevantChunks);
  const maxIndex = sources.length;
  const cited = parseSourceRefsFromAnswer(answerText);
  const validCited = cited.filter((n) => n >= 1 && n <= maxIndex);
  const invalidCited = cited.filter((n) => n < 1 || n > maxIndex);

  const verifiedSources = sources.filter((s) => validCited.includes(s.index));
  // If model cited nothing but we have context, still return all retrieved sources for UI
  const responseSources = verifiedSources.length ? verifiedSources : sources;

  return {
    sources: responseSources,
    allRetrievedSources: sources,
    citedIndexes: validCited,
    invalidCitations: invalidCited,
    citationValid: invalidCited.length === 0,
  };
}

function filterModelSources(modelSources, allowedChunks) {
  const allowed = new Set((allowedChunks || []).map((c) => c.chunkIndex));
  if (!Array.isArray(modelSources) || !modelSources.length) {
    return buildGroundedSources(allowedChunks);
  }
  const filtered = modelSources.filter((s) => {
    const idx = s.chunkIndex ?? s.index;
    return allowed.has(idx) || allowed.has(Number(idx) - 1);
  });
  return filtered.length ? filtered : buildGroundedSources(allowedChunks);
}

module.exports = {
  buildGroundedSources,
  filterModelSources,
  parseSourceRefsFromAnswer,
  validateAnswerCitations,
};
