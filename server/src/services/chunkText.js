/** Production-aligned chunker (same strategy as aiService.chunkText). */
function chunkText(text, maxChunkSize = 500) {
  if (!text || text.trim().length === 0) return [];
  const cleaned = String(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if ((currentChunk ? currentChunk + '\n\n' + trimmed : trimmed).length <= maxChunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmed.length > maxChunkSize) {
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if ((sentenceChunk ? sentenceChunk + ' ' + sentence : sentence).length <= maxChunkSize) {
            sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + sentence : sentence;
          } else {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          }
        }
        currentChunk = sentenceChunk ? sentenceChunk.trim() : '';
      } else {
        currentChunk = trimmed;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks.map((chunkText, chunkIndex) => ({ chunkText, chunkIndex }));
}
module.exports = { chunkText };
