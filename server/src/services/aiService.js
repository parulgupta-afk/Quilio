const { GoogleGenerativeAI } = require('@google/generative-ai');

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is missing in server/.env');
  }
  return new GoogleGenerativeAI(key);
}

// ==================== EMBEDDINGS ====================

/**
 * Generate embedding for a piece of text using Gemini
 * Model: text-embedding-004 (768 dimensions)
 */
async function generateEmbedding(text) {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'text-embedding-004' });
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
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash',
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
- Start from the article content. Prefer saying "Based on this article..." when appropriate.
- If the answer is in the context, explain it clearly and cite the source number like [Source 1].
- If the article does not contain enough information, say: "This article does not cover that clearly." Do not invent facts.
- Keep answers clear, structured, and educational.
- Never claim general web knowledge as if it came from the article.`;

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

// ==================== LEARN THIS ====================

/**
 * Extract key concepts + generate a quiz from post content
 */
async function generateLearnContent(title, content) {
  const prompt = `You are an expert educational content creator.

Given this technical article, generate a learning package as JSON only.

ARTICLE TITLE: ${title}

ARTICLE CONTENT:
${String(content || "").substring(0, 8000)}

Return ONLY a JSON object (no markdown) with this shape:
{
  "summary": "2-3 sentence summary",
  "beginnerExplanation": "simple explanation 3-5 sentences",
  "intermediateExplanation": "deeper explanation 3-5 sentences",
  "keyConcepts": ["c1","c2","c3","c4","c5"],
  "terminology": [{"term":"Term","definition":"definition"}],
  "prerequisites": ["prereq1","prereq2"],
  "questions": [
    {
      "question": "Question?",
      "type": "mcq",
      "options": ["A","B","C","D"],
      "correctAnswer": "A",
      "explanation": "why"
    }
  ],
  "flashcards": [{"front":"prompt","back":"answer"}]
}

Rules:
- 5-8 keyConcepts
- 6-8 questions mixing mcq and true_false
- true_false options must be ["True","False"]
- correctAnswer must exactly equal one option
- 6-10 flashcards
- content must come from the article`;

  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-flash-latest",
  ];

  let lastError = null;
  let data = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      // Extract JSON object if extra text exists
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first >= 0 && last > first) {
        text = text.slice(first, last + 1);
      }

      data = JSON.parse(text);
      console.log("Learn content generated with model:", modelName);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      console.warn("Learn model failed:", modelName, err.message);
    }
  }

  if (!data) {
    // Offline-safe fallback so UI still works without Gemini
    console.error("All Gemini models failed for Learn This:", lastError?.message);
    const words = String(content || "")
      .replace(/[#*`]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 40);
    const topic = title || "this article";
    data = {
      summary: `This learning package is based on "${topic}". Review the key ideas below, then try the quiz.`,
      beginnerExplanation: `This article is about ${topic}. Read the key concepts and flashcards, then test yourself with the quiz questions.`,
      intermediateExplanation: `Focus on the main arguments in "${topic}". Use the terminology list to lock definitions, then complete the quiz to check retention.`,
      keyConcepts: words.length
        ? [...new Set(words.map((w) => w.replace(/[^a-zA-Z0-9-]/g, "")))].filter(Boolean).slice(0, 6)
        : [topic, "Core idea", "Key terms", "Practice", "Summary"],
      terminology: [
        { term: "Main topic", definition: topic },
        { term: "Goal", definition: "Understand and recall the article's core points" },
      ],
      prerequisites: ["Basic reading of the article"],
      questions: [
        {
          question: `What is the main topic of the article?`,
          type: "mcq",
          options: [topic, "Unrelated sports news", "A random recipe", "None of the above"],
          correctAnswer: topic,
          explanation: "The title and content focus on this topic.",
        },
        {
          question: "True or False: Active recall (quiz/flashcards) helps retention.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Testing yourself strengthens memory.",
        },
        {
          question: "What should you do after reading key concepts?",
          type: "mcq",
          options: ["Ignore them", "Practice with flashcards or quiz", "Close the tab", "Only memorize the title"],
          correctAnswer: "Practice with flashcards or quiz",
          explanation: "Practice turns passive reading into learning.",
        },
        {
          question: "True or False: This quiz is meant to check understanding of the article.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Learn This is built from the post content.",
        },
      ],
      flashcards: [
        { front: "What is this article mainly about?", back: topic },
        { front: "Best way to remember concepts?", back: "Use flashcards and take the quiz" },
        { front: "Where do answers come from?", back: "The article content itself" },
      ],
      _fallback: true,
    };
  }

  // Normalize questions for schema safety
  const questions = (data.questions || [])
    .map((q) => {
      const type = q.type === "true_false" ? "true_false" : "mcq";
      let options = Array.isArray(q.options) ? q.options.map(String) : [];
      if (type === "true_false") options = ["True", "False"];
      if (!options.length) options = ["Option A", "Option B", "Option C", "Option D"];
      let correctAnswer = String(q.correctAnswer || options[0]);
      if (!options.includes(correctAnswer)) correctAnswer = options[0];
      return {
        question: String(q.question || "Question"),
        type,
        options,
        correctAnswer,
        explanation: String(q.explanation || ""),
      };
    })
    .filter((q) => q.question);

  const flashcards = (data.flashcards || [])
    .map((f) => ({
      front: String(f.front || ""),
      back: String(f.back || ""),
    }))
    .filter((f) => f.front && f.back);

  const terminology = (data.terminology || [])
    .map((t) => ({
      term: String(t.term || t.name || ""),
      definition: String(t.definition || t.meaning || ""),
    }))
    .filter((t) => t.term && t.definition);

  return {
    summary: String(data.summary || ""),
    beginnerExplanation: String(data.beginnerExplanation || ""),
    intermediateExplanation: String(data.intermediateExplanation || ""),
    keyConcepts: Array.isArray(data.keyConcepts)
      ? data.keyConcepts.map(String).filter(Boolean)
      : [],
    terminology,
    prerequisites: Array.isArray(data.prerequisites)
      ? data.prerequisites.map(String).filter(Boolean)
      : [],
    questions: questions.length
      ? questions
      : [
          {
            question: `What is the article "${title}" about?`,
            type: "mcq",
            options: [title, "Something else", "Not sure", "None"],
            correctAnswer: title,
            explanation: "Based on the post title.",
          },
        ],
    flashcards,
  };
}

// ==================== WRITE WITH AI ====================

/**
 * Conversational writing assistant.
 * modes: brainstorm | expand | complete | review | rewrite | outline
 */
async function writeWithAI({ mode, title, draft, userMessage, history = [] }) {
  try {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 4096,
      },
    });

    const modeInstructions = {
      brainstorm:
        'Help the author brainstorm and shape their ideas into a clear article direction. Ask clarifying questions if needed, then propose angles, structure, and key points.',
      expand:
        'Expand the author\'s rough ideas into fuller paragraphs while keeping their voice and intent. Do not invent facts they did not imply.',
      complete:
        'Complete or continue the draft naturally from where it left off. Match tone and technical level. Return usable draft text the author can paste.',
      review:
        'Review the draft critically: clarity, structure, accuracy risks, missing sections, and readability. Be specific and actionable. Do not rewrite the whole piece unless asked.',
      rewrite:
        'Rewrite the draft to improve clarity and flow while preserving meaning. Return the improved full draft text.',
      outline:
        'Produce a clear outline (H2/H3 style) from the author\'s ideas, suitable for a technical blog post.',
    };

    const instruction = modeInstructions[mode] || modeInstructions.expand;

    const historyText = (history || [])
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Author' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are Quilio Write — an AI writing partner for technical bloggers.

Mode: ${mode}
Your job: ${instruction}

Rules:
- Stay helpful and concrete.
- Prefer the author's ideas over inventing new claims.
- When producing draft text, mark it clearly so the author can apply it.
- For review mode, use short bullet points.
- Keep responses focused (not overly long unless completing a full draft).

Current title (may be empty): ${title || '(none yet)'}

Current draft (may be empty):
${(draft || '(empty)').substring(0, 12000)}

${historyText ? `Conversation so far:\n${historyText}\n` : ''}
Author: ${userMessage}
Assistant:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Write with AI error:', error.message);
    throw new Error('Failed to generate writing assistance');
  }
}

module.exports = {
  generateEmbedding,
  chunkText,
  chatWithPost,
  cosineSimilarity,
  generateLearnContent,
  writeWithAI,
};
