function chunkText(text, maxChunkSize = 500) {
  if (!text || text.trim().length === 0) return [];
  const cleaned = String(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';
  let searchFrom = 0;

  const pushChunk = (chunkStr) => {
    const str = String(chunkStr).trim();
    if (!str) return;
    const idx = cleaned.indexOf(str, searchFrom);
    const startOff = idx >= 0 ? idx : searchFrom;
    const endOff = startOff + str.length;
    searchFrom = endOff;
    chunks.push({
      chunkText: str,
      chunkIndex: chunks.length,
      startOffset: startOff,
      endOffset: endOff,
    });
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if ((currentChunk ? currentChunk + '\n\n' + trimmed : trimmed).length <= maxChunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    } else {
      if (currentChunk) pushChunk(currentChunk);
      if (trimmed.length > maxChunkSize) {
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if ((sentenceChunk ? sentenceChunk + ' ' + sentence : sentence).length <= maxChunkSize) {
            sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + sentence : sentence;
          } else {
            if (sentenceChunk) pushChunk(sentenceChunk.trim());
            sentenceChunk = sentence;
          }
        }
        currentChunk = sentenceChunk ? sentenceChunk.trim() : '';
      } else {
        currentChunk = trimmed;
      }
    }
  }
  if (currentChunk) pushChunk(currentChunk);
  return chunks;
}
module.exports = { chunkText };
