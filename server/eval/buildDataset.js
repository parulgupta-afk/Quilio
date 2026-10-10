/**
 * Build evaluation dataset from real seed (+ domain-extended) articles
 * using production-aligned chunkText.
 */
const fs = require('fs');
const path = require('path');
const { chunkText } = require('../src/services/chunkText');
const { fixtureEmbed, FIXTURE_DIMS, FIXTURE_BACKEND } = require('./fixtureEmbedder');

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpusArticles.json'), 'utf8'));

// Manually designed questions; relevant chunks resolved from evidence substrings present in real chunks
const QUESTION_SPECS = [
  { id: 'q01', articleId: 'seed-bst', question: 'What is the average time complexity of lookups in a BST?', answerable: true, category: 'direct', evidence: ['O(log n)'] },
  { id: 'q02', articleId: 'seed-bst', question: 'Where are smaller values stored relative to a node in a BST?', answerable: true, category: 'direct', evidence: ['Left subtree', 'smaller'] },
  { id: 'q03', articleId: 'seed-bst', question: 'What happens if you insert sorted data into a naive BST?', answerable: true, category: 'direct', evidence: ['linked list'] },
  { id: 'q04', articleId: 'seed-bst', question: 'What complexity do BST operations degrade to when the tree is skewed?', answerable: true, category: 'direct', evidence: ['O(n)'] },
  { id: 'q05', articleId: 'seed-bst', question: 'When do BSTs shine according to the article?', answerable: true, category: 'direct', evidence: ['order and structure'] },
  { id: 'q06', articleId: 'seed-bst', question: 'How many children can each BST node have at most?', answerable: true, category: 'direct', evidence: ['two children'] },
  { id: 'q07', articleId: 'seed-bst', question: 'What is the capital of Mars?', answerable: false, category: 'out_of_scope', evidence: [] },
  { id: 'q08', articleId: 'seed-hooks', question: 'What do React hooks let function components hold?', answerable: true, category: 'direct', evidence: ['state and side effects'] },
  { id: 'q09', articleId: 'seed-hooks', question: 'What does useState return?', answerable: true, category: 'direct', evidence: ['value and a setter'] },
  { id: 'q10', articleId: 'seed-hooks', question: 'When does useEffect run?', answerable: true, category: 'direct', evidence: ['after paint'] },
  { id: 'q11', articleId: 'seed-hooks', question: 'Where must hooks be called?', answerable: true, category: 'direct', evidence: ['top level'] },
  { id: 'q12', articleId: 'seed-hooks', question: 'How do I configure Kubernetes ingress?', answerable: false, category: 'unrelated', evidence: [] },
  { id: 'q13', articleId: 'seed-rag', question: 'What does Retrieval-Augmented Generation ground an LLM in?', answerable: true, category: 'direct', evidence: ['documents'] },
  { id: 'q14', articleId: 'seed-rag', question: 'List the RAG pipeline steps described in the article.', answerable: true, category: 'multi_chunk', evidence: ['Chunk documents', 'Embed chunks'] },
  { id: 'q15', articleId: 'seed-rag', question: 'What Quilio feature uses the RAG idea?', answerable: true, category: 'direct', evidence: ['Chat with a blog'] },
  { id: 'q16', articleId: 'seed-rag', question: 'Should generation happen before retrieval in the described pipeline?', answerable: true, category: 'synthesis', evidence: ['Retrieve similar', 'Generate an answer'] },
  { id: 'q17', articleId: 'seed-rag', question: 'Who won the 2010 FIFA World Cup?', answerable: false, category: 'out_of_scope', evidence: [] },
  { id: 'q18', articleId: 'eval-jwt', question: 'What are the three parts of a JWT?', answerable: true, category: 'direct', evidence: ['header, payload, and signature'] },
  { id: 'q19', articleId: 'eval-jwt', question: 'How do clients typically send JWTs to the server?', answerable: true, category: 'direct', evidence: ['Authorization Bearer'] },
  { id: 'q20', articleId: 'eval-jwt', question: 'Should API secrets be stored in the frontend?', answerable: true, category: 'direct', evidence: ['Never store API secrets'] },
  { id: 'q21', articleId: 'eval-jwt', question: 'What should servers validate on protected requests?', answerable: true, category: 'direct', evidence: ['signature and claims'] },
  { id: 'q22', articleId: 'eval-jwt', question: 'What is MongoDB WiredTiger cache sizing?', answerable: false, category: 'out_of_scope', evidence: [] },
  { id: 'q23', articleId: 'eval-embed', question: 'What are the typical steps of an embedding pipeline?', answerable: true, category: 'multi_chunk', evidence: ['normalize text', 'split into chunks'] },
  { id: 'q24', articleId: 'eval-embed', question: 'Why must query and document embeddings share model and dimension?', answerable: true, category: 'direct', evidence: ['same model and dimension'] },
  { id: 'q25', articleId: 'eval-embed', question: 'How can a system refuse questions an article does not support?', answerable: true, category: 'direct', evidence: ['minimum similarity threshold'] },
  { id: 'q26', articleId: 'eval-embed', question: 'Is purple the optimal learning rate for SGD?', answerable: false, category: 'ambiguous', evidence: [] },
  { id: 'q27', articleId: 'seed-bst', question: 'Compare left and right subtree ordering rules.', answerable: true, category: 'synthesis', evidence: ['smaller', 'larger'] },
  { id: 'q28', articleId: 'seed-hooks', question: 'What does calling the useState setter do?', answerable: true, category: 'direct', evidence: ['re-render'] },
];

const articleChunks = {};
for (const a of articles) {
  const chunks = chunkText(a.content, 220);
  articleChunks[a.id] = chunks.map((c) => ({
    ...c,
    articleId: a.id,
    embedding: fixtureEmbed(c.chunkText),
  }));
}

function resolveRelevant(articleId, evidence) {
  if (!evidence?.length) return [];
  const chunks = articleChunks[articleId] || [];
  const hits = [];
  for (const c of chunks) {
    const lower = c.chunkText.toLowerCase();
    if (evidence.some((e) => lower.includes(String(e).toLowerCase()))) {
      hits.push(c.chunkIndex);
    }
  }
  return [...new Set(hits)];
}

const examples = QUESTION_SPECS.map((q) => {
  const relevantChunkIndices = q.answerable ? resolveRelevant(q.articleId, q.evidence) : [];
  return {
    id: q.id,
    question: q.question,
    articleId: q.articleId,
    answerable: q.answerable,
    category: q.category,
    evidenceSubstrings: q.evidence,
    relevantChunkIndices,
    queryEmbedding: fixtureEmbed(q.question),
  };
});

// Warn if answerable questions have no resolved evidence (labeling error)
for (const ex of examples) {
  if (ex.answerable && ex.relevantChunkIndices.length === 0) {
    console.warn('WARNING: no chunk evidence for', ex.id, ex.question);
  }
}

const dataset = {
  version: '2.1.0',
  notes:
    'Questions grounded in seedDemo.js posts plus domain-extended eval articles. Offline vectors use fixture-hash-ngram-v1 (NOT Gemini). Live eval uses Gemini embeddings separately.',
  fixtureEmbedder: FIXTURE_BACKEND,
  fixtureDims: FIXTURE_DIMS,
  productionRetrievalMirror: 'cosine + topK + minScore (retrieveInApp style)',
  articles,
  articleChunks,
  examples,
  builtAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(__dirname, 'dataset.v2.json'), JSON.stringify(dataset, null, 2));
console.log(
  JSON.stringify(
    {
      articles: articles.length,
      questions: examples.length,
      answerable: examples.filter((e) => e.answerable).length,
      unanswerable: examples.filter((e) => !e.answerable).length,
      chunks: Object.values(articleChunks).flat().length,
      unlabeledAnswerable: examples.filter((e) => e.answerable && !e.relevantChunkIndices.length).length,
    },
    null,
    2
  )
);
