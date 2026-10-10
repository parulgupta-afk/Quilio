/**
 * Re-embed published posts for the configured embedding model/dimensions.
 *
 * Usage:
 *   node scripts/reindexEmbeddings.js [--dry-run] [--all] [--limit=20]
 *
 * - Default: only posts with missing/failed/mismatched embeddingModel
 * - --all: reprocess all published posts
 * - --dry-run: list targets only, no writes
 * - processPostEmbeddings deletes existing chunks for a post before insert (no duplicates)
 *
 * Does NOT run on server startup.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const EmbeddingChunk = require('../src/models/EmbeddingChunk');
const { processPostEmbeddings } = require('../src/services/embeddingPipeline');
const { getEmbeddingModelName, getEmbeddingDims } = require('../src/services/modelConfig');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const all = process.argv.includes('--all');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 20;

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI required');
    process.exit(1);
  }

  const model = getEmbeddingModelName();
  const dims = getEmbeddingDims();
  console.log(JSON.stringify({ action: 'reindex_start', model, dims, dryRun, all, limit }));

  await mongoose.connect(process.env.MONGODB_URI);

  const query = all
    ? { status: 'published' }
    : {
        status: 'published',
        $or: [
          { embeddingStatus: { $ne: 'completed' } },
          { embeddingModel: { $ne: model } },
          { embeddingModel: { $exists: false } },
          { embeddingModel: '' },
        ],
      };

  const posts = await Post.find(query).sort({ updatedAt: -1 }).limit(limit).select('_id title embeddingStatus embeddingModel');
  console.log(JSON.stringify({ candidates: posts.length }));

  if (dryRun) {
    for (const p of posts) {
      const chunkCount = await EmbeddingChunk.countDocuments({ post: p._id });
      console.log(
        JSON.stringify({
          dryRun: true,
          postId: String(p._id),
          title: (p.title || '').slice(0, 60),
          embeddingStatus: p.embeddingStatus,
          embeddingModel: p.embeddingModel || null,
          existingChunks: chunkCount,
        })
      );
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  let ok = 0;
  let fail = 0;
  for (const post of posts) {
    const full = await Post.findById(post._id);
    process.stdout.write(`Embedding ${post._id}… `);
    try {
      const before = await EmbeddingChunk.countDocuments({ post: post._id });
      const result = await processPostEmbeddings(post._id, full.content);
      const after = await EmbeddingChunk.countDocuments({ post: post._id });
      if (result?.ok) {
        ok++;
        console.log(`ok chunks=${result.chunks} before=${before} after=${after}`);
      } else {
        fail++;
        console.log(`fail ${result?.reason || ''}`);
      }
    } catch (err) {
      fail++;
      console.log(`fail ${err.message}`);
    }
  }

  console.log(JSON.stringify({ ok, fail, model, dims }));
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
