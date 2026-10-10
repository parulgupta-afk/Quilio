/**
 * Build offline evaluation fixtures using the real Quilio chunker.
 * No API key required.
 */
const fs = require('fs');
const path = require('path');
const { chunkText } = require('../src/services/chunkText');

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpusArticles.json'), 'utf8'));

const labeled = [
  { id: 'q01', articleId: 'bst', question: 'What is a binary search tree?', answerable: true, category: 'direct', mustContain: ['binary tree', 'children'] },
  { id: 'q02', articleId: 'bst', question: 'Where do smaller values go in a BST?', answerable: true, category: 'direct', mustContain: ['left'] },
  { id: 'q03', articleId: 'bst', question: 'What order does inorder traversal visit nodes?', answerable: true, category: 'direct', mustContain: ['left', 'right'] },
  { id: 'q04', articleId: 'bst', question: 'Does inorder on a BST produce sorted keys?', answerable: true, category: 'synthesis', mustContain: ['sorted'] },
  { id: 'q05', articleId: 'bst', question: 'What is average search complexity on a balanced BST?', answerable: true, category: 'direct', mustContain: ['log'] },
  { id: 'q06', articleId: 'bst', question: 'What happens if a BST is skewed?', answerable: true, category: 'direct', mustContain: ['O(n)', 'skewed'] },
  { id: 'q07', articleId: 'bst', question: 'Name two self-balancing tree types.', answerable: true, category: 'direct', mustContain: ['AVL'] },
  { id: 'q08', articleId: 'bst', question: 'What is the capital of France?', answerable: false, category: 'out_of_scope' },
  { id: 'q09', articleId: 'bst', question: 'How do I cook pasta?', answerable: false, category: 'unrelated' },
  { id: 'q10', articleId: 'rag', question: 'What does RAG stand for?', answerable: true, category: 'direct', mustContain: ['Retrieval'] },
  { id: 'q11', articleId: 'rag', question: 'What happens to documents before indexing?', answerable: true, category: 'multi_chunk', mustContain: ['chunk'] },
  { id: 'q12', articleId: 'rag', question: 'What should the system do if retrieval finds no support?', answerable: true, category: 'direct', mustContain: ['refuse'] },
  { id: 'q13', articleId: 'rag', question: 'Should citations refer to non-retrieved text?', answerable: true, category: 'direct', mustContain: ['retrieved'] },
  { id: 'q14', articleId: 'rag', question: 'Which factors affect RAG answer quality?', answerable: true, category: 'synthesis', mustContain: ['threshold'] },
  { id: 'q15', articleId: 'rag', question: 'Who won the 1998 World Cup?', answerable: false, category: 'out_of_scope' },
  { id: 'q16', articleId: 'jwt', question: 'What are the three parts of a JWT?', answerable: true, category: 'direct', mustContain: ['header', 'payload'] },
  { id: 'q17', articleId: 'jwt', question: 'How do clients typically send JWTs?', answerable: true, category: 'direct', mustContain: ['Bearer'] },
  { id: 'q18', articleId: 'jwt', question: 'Should API secrets live in the frontend?', answerable: true, category: 'direct', mustContain: ['Never'] },
  { id: 'q19', articleId: 'jwt', question: 'Why use token expiration?', answerable: true, category: 'synthesis', mustContain: ['expire'] },
  { id: 'q20', articleId: 'jwt', question: 'What is MongoDB sharding?', answerable: false, category: 'out_of_scope' },
  { id: 'q21', articleId: 'bst', question: 'Explain left and right child ordering rules.', answerable: true, category: 'multi_chunk', mustContain: ['less', 'greater'] },
  { id: 'q22', articleId: 'rag', question: 'Describe the query-time RAG pipeline.', answerable: true, category: 'multi_chunk', mustContain: ['embed', 'retrieve'] },
  { id: 'q23', articleId: 'jwt', question: 'What must servers validate on protected requests?', answerable: true, category: 'direct', mustContain: ['signature'] },
  { id: 'q24', articleId: 'bst', question: 'Is purple the best color for tree edges?', answerable: false, category: 'ambiguous' },
  { id: 'q25', articleId: 'rag', question: 'Can inventing facts improve RAG quality?', answerable: true, category: 'direct', mustContain: ['refuse', 'invent'] },
  { id: 'q26', articleId: 'jwt', question: 'What is a refresh token used for?', answerable: true, category: 'direct', mustContain: ['Refresh'] },
  { id: 'q27', articleId: 'bst', question: 'Compare balanced vs skewed BST performance.', answerable: true, category: 'synthesis', mustContain: ['log', 'skewed'] },
  { id: 'q28', articleId: 'rag', question: 'Where are embeddings stored?', answerable: true, category: 'direct', mustContain: ['vector'] },
  { id: 'q29', articleId: 'jwt', question: 'Describe JWT structure briefly.', answerable: true, category: 'direct', mustContain: ['three'] },
  { id: 'q30', articleId: 'bst', question: 'How many children can a binary tree node have at most?', answerable: true, category: 'direct', mustContain: ['two'] },
];

const articleChunks = {};
for (const a of articles) {
  articleChunks[a.id] = chunkText(a.content).map((c) => ({
    ...c,
    articleId: a.id,
  }));
}

function findRelevant(articleId, mustContain = []) {
  const chunks = articleChunks[articleId] || [];
  if (!mustContain.length) return [];
  const hits = [];
  for (const c of chunks) {
    const lower = c.chunkText.toLowerCase();
    if (mustContain.some((m) => lower.includes(String(m).toLowerCase()))) {
      hits.push(c.chunkIndex);
    }
  }
  return hits;
}

const examples = labeled.map((q) => {
  const relevantChunkIndices = q.answerable ? findRelevant(q.articleId, q.mustContain) : [];
  return {
    id: q.id,
    question: q.question,
    articleId: q.articleId,
    answerable: q.answerable,
    category: q.category,
    relevantChunkIndices,
    mustContain: q.mustContain || [],
  };
});

const out = {
  version: '2.0.0',
  notes: 'Offline fixtures built with Quilio chunkText(). Labels derived from mustContain substring evidence on real chunks. Not a substitute for human adjudication on production traffic.',
  articles,
  articleChunks,
  examples,
  builtAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(__dirname, 'fixtures.v2.json'), JSON.stringify(out, null, 2));
console.log('Fixtures:', examples.length, 'questions,', Object.values(articleChunks).flat().length, 'chunks');
