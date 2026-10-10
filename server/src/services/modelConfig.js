/**
 * Gemini model configuration (verified against Google deprecations as of 2026-10).
 * https://ai.google.dev/gemini-api/docs/deprecations
 */
function getChatModelName() {
  return process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || 'gemini-3.6-flash';
}
function getWritingModelName() {
  return process.env.GEMINI_WRITING_MODEL || getChatModelName();
}
function getEmbeddingModelName() {
  return process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
}
function getEmbeddingDims() {
  return Number(process.env.EMBEDDING_DIMS || process.env.GEMINI_EMBEDDING_DIMS || 768);
}
function getModelConfig() {
  return {
    chatModel: getChatModelName(),
    writingModel: getWritingModelName(),
    embeddingModel: getEmbeddingModelName(),
    embeddingDims: getEmbeddingDims(),
  };
}
module.exports = {
  getChatModelName,
  getWritingModelName,
  getEmbeddingModelName,
  getEmbeddingDims,
  getModelConfig,
};
