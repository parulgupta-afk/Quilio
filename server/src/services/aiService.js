const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==================== EMBEDDINGS ====================

/**
 * Generate embedding for a piece of text using Gemini
 * Model: text-embedding-004 (768 dimensions)
 */
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw new Error('Failed to generate embedding');
  }
}

// ==================== CHUNKING ====================

/**
 * Split post content into semantic chunks
 * Strategy: Split by paragraphs / headings, keep chunks ~300-600 characters
 */
function chunkText(text, maxChunkSize = 500) {
  if (!text || text.trim().length === 0) return [];

  // Clean the text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split by double newlines (paragraphs) first
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if ((currentChunk + '\n\n' + trimmed).length <= maxChunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      // If a single paragraph is too long, split by sentences
      if (trimmed.length > maxChunkSize) {
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if ((sentenceChunk + ' ' + sentence).length <= maxChunkSize) {
            sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + sentence : sentence;
          } else {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          }
        }
        if (sentenceChunk) currentChunk = sentenceChunk.trim();
        else currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks.map((text, index) => ({
    chunkText: text,
    chunkIndex: index,
  }));
}

// ==================== RAG CHAT ====================

/**
 * Answer a question using only the provided context chunks (RAG)
 */
async function chatWithPost(question, contextChunks, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    // Build context string with citations
    const contextText = contextChunks
      .map(
        (chunk, i) =>
          `[Source ${i + 1}]\n${chunk.chunkText}`
      )
      .join('\n\n---\n\n');

    const systemInstruction = `You are a helpful AI tutor for the Quilio learning platform.

Answer the user's question using ONLY the provided article context below.
- If the answer is in the context, explain it clearly and cite the source number like [Source 1].
- If the article does not contain enough information to answer, say so honestly.
- Do not invent information that is not present in the context.
- Keep answers clear, structured, and educational.`;

    // Build conversation
    const historyText = conversationHistory
      .slice(-6) // keep last 6 messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemInstruction}

ARTICLE CONTEXT:
${contextText}

${historyText ? `PREVIOUS CONVERSATION:\n${historyText}\n` : ''}
User: ${question}
Assistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    return {
      answer,
      sources: contextChunks.map((c, i) => ({
        index: i + 1,
        text: c.chunkText.substring(0, 150) + (c.chunkText.length > 150 ? '...' : ''),
        chunkIndex: c.chunkIndex,
      })),
    };
  } catch (error) {
    console.error('RAG chat error:', error.message);
    throw new Error('Failed to generate answer');
  }
}

/**
 * Simple cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  chunkText,
  chatWithPost,
  cosineSimilarity,
};

// ==================== LEARN THIS ====================

/**
 * Extract key concepts + generate a quiz from post content
 */
async function generateLearnContent(title, content) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are an expert educational content creator.

Given the following technical article, generate a learning package.

ARTICLE TITLE: ${title}

ARTICLE CONTENT:
${content.substring(0, 8000)}

Return a JSON object with this exact structure:
{
  "summary": "A clear 2-3 sentence summary of the article",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
  "questions": [
    {
      "question": "Question text?",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    },
    {
      "question": "True or False statement?",
      "type": "true_false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Explanation"
    }
  ]
}

Rules:
- Generate exactly 5-8 key concepts
- Generate exactly 6-8 questions (mix of MCQ and True/False)
- Questions must be answerable from the article
- correctAnswer must exactly match one of the options
- Keep language clear and educational
- Return ONLY valid JSON, no markdown`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON (handle possible markdown wrapping)
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const data = JSON.parse(cleaned);

    // Basic validation
    if (!data.keyConcepts || !data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid response structure from Gemini');
    }

    return data;
  } catch (error) {
    console.error('Learn content generation error:', error.message);
    throw new Error('Failed to generate learning content');
  }
}

module.exports = {
  generateEmbedding,
  chunkText,
  chatWithPost,
  cosineSimilarity,
  generateLearnContent,
};
