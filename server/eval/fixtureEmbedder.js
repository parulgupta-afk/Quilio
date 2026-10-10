/**
 * Deterministic fixture embedder for offline CI only — NOT Gemini.
 * Word tokens + character n-grams hashed into fixed dims, L2-normalized.
 */
function fixtureEmbed(text, dims = 128) {
  const vec = new Array(dims).fill(0);
  const raw = String(text || '').toLowerCase();
  const words = raw.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  const add = (token, weight) => {
    let h = 2166136261;
    for (let i = 0; i < token.length; i++) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dims;
    vec[idx] += weight;
  };

  for (const w of words) {
    add('W:' + w, 3);
    if (w.length >= 4) add('W2:' + w.slice(0, 4), 1.5);
  }
  const s = ` ${raw.replace(/\s+/g, ' ').trim()} `;
  for (let n = 3; n <= 4; n++) {
    for (let i = 0; i + n <= s.length; i++) add('G:' + s.slice(i, i + n), 0.35);
  }

  let norm = 0;
  for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dims; i++) vec[i] /= norm;
  return vec;
}

module.exports = { fixtureEmbed, FIXTURE_DIMS: 128, FIXTURE_BACKEND: 'fixture-hash-word-ngram-v2' };
