require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const { processPostEmbeddings } = require('../src/services/embeddingPipeline');
const { getEmbeddingModelName, getEmbeddingDims } = require('../src/services/aiService');

async function main() {
  const all = process.argv.includes('--all');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 20;
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI required');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const model = getEmbeddingModelName();
  const dims = getEmbeddingDims();
  console.log('Target model', model, 'dims', dims);
  const query = all
    ? { status: 'published' }
    : {
        status: 'published',
        $or: [
          { embeddingStatus: { $ne: 'completed' } },
          { embeddingModel: { $ne: model } },
          { embeddingModel: { $exists: false } },
        ],
      };
  const posts = await Post.find(query).sort({ updatedAt: -1 }).limit(limit);
  console.log('Posts to process:', posts.length);
  let ok = 0;
  let fail = 0;
  for (const post of posts) {
    process.stdout.write(`Embedding ${post._id}… `);
    const result = await processPostEmbeddings(post._id, post.content);
    if (result?.ok) {
      ok++;
      console.log('ok');
    } else {
      fail++;
      console.log('fail');
    }
  }
  console.log(JSON.stringify({ ok, fail, model, dims }));
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
