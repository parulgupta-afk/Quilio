/**
 * Seed 3 demo posts so the feed isn't empty for demos.
 * Usage (from server folder, with .env loaded):
 *   node src/scripts/seedDemo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = require('../models/User');
  const Post = require('../models/Post');

  let user = await User.findOne({ email: 'demo@quilio.app' });
  if (!user) {
    const hash = await bcrypt.hash('demo1234', 10);
    user = await User.create({
      name: 'Quilio Demo',
      email: 'demo@quilio.app',
      password: hash,
      bio: 'Sample author for empty-feed demos',
    });
    console.log('Created demo user: demo@quilio.app / demo1234');
  }

  const samples = [
    {
      title: 'Understanding Binary Search Trees',
      content: `A binary search tree (BST) stores ordered data so that lookups, inserts, and deletes can average O(log n) time.

Each node has at most two children. Left subtree values are smaller; right subtree values are larger.

## Why balance matters
If you insert sorted data into a naive BST, the tree becomes a linked list and operations degrade to O(n). Self-balancing trees (AVL, Red-Black) fix this with rotations.

## When to use a BST
- You need ordered traversal
- Range queries matter
- You want predictable in-order listing

Hash maps win at average O(1) exact key lookup, but they do not keep keys sorted.

## Takeaway
BSTs shine when order and structure matter—not only when you need a fast dictionary.`,
      tags: ['data-structures', 'algorithms'],
      status: 'published',
    },
    {
      title: 'React Hooks without the magic',
      content: `Hooks let function components hold state and side effects.

## useState
useState returns a value and a setter. Calling the setter schedules a re-render with the new value. State updates may be batched.

## useEffect
useEffect runs after paint. Use it for synchronization: network requests, subscriptions, manual DOM work. The dependency array controls when the effect re-runs.

## Rules of Hooks
- Only call hooks at the top level
- Only call hooks from React functions

## Mental model
State is data React remembers between renders. Effects are how you sync with the outside world after React updates the UI.`,
      tags: ['react', 'frontend'],
      status: 'published',
    },
    {
      title: 'RAG in plain English',
      content: `Retrieval-Augmented Generation (RAG) grounds an LLM in your documents.

## Pipeline
1. Chunk the document into passages
2. Embed each chunk into a vector
3. Embed the user question
4. Retrieve the most similar chunks
5. Ask the model to answer using only those chunks

## Why citations matter
If the model must cite retrieved passages, hallucinations drop and readers can verify claims.

## On Quilio
Chat with a blog uses this idea: answers are built from the article itself, not the open web.`,
      tags: ['ai', 'rag'],
      status: 'published',
    },
  ];

  for (const s of samples) {
    const exists = await Post.findOne({ title: s.title, author: user._id });
    if (exists) {
      console.log('Skip existing:', s.title);
      continue;
    }
    await Post.create({ ...s, author: user._id });
    console.log('Created:', s.title);
  }

  console.log('Done. Open the home feed.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
