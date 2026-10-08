/**
 * Seed demo authors + posts. Safe to re-run.
 * Also RESETS demo author passwords to demo1234 (fixes old bad hashes).
 *
 *   cd server && npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = require('../models/User');
  const Post = require('../models/Post');

  const AUTHORS = [
    { name: 'Aria Chen', email: 'aria@quilio.app', bio: 'Software engineer. Distributed systems & DX.' },
    { name: 'Marcus Webb', email: 'marcus@quilio.app', bio: 'ML researcher. Making AI legible.' },
    { name: 'Priya Nair', email: 'priya@quilio.app', bio: 'Frontend architect. React & CSS.' },
    { name: 'Eliot Ramos', email: 'eliot@quilio.app', bio: 'DevOps / Platform eng.' },
    { name: 'Sofia Andrade', email: 'sofia@quilio.app', bio: 'Full-stack + product.' },
  ];

  const users = [];
  for (const a of AUTHORS) {
    let u = await User.findOne({ email: a.email }).select('+passwordHash');
    if (!u) {
      u = await User.create({
        name: a.name,
        email: a.email,
        passwordHash: 'demo1234', // pre-save hashes once
        bio: a.bio,
      });
      console.log(`Created: ${a.email} / demo1234`);
    } else {
      // Reset password so login always works for demo accounts
      u.passwordHash = 'demo1234';
      u.bio = a.bio || u.bio;
      await u.save();
      console.log(`Reset password: ${a.email} / demo1234`);
    }
    users.push(u);
  }

  const [aria] = users;

  const samples = [
    {
      author: aria._id,
      title: 'Understanding Binary Search Trees',
      tags: ['data-structures', 'algorithms'],
      status: 'published',
      content: `A binary search tree (BST) stores ordered data so lookups, inserts, and deletes average O(log n).

Each node has at most two children. Left subtree values are smaller; right subtree values are larger.

## Why balance matters
If you insert sorted data into a naive BST, the tree becomes a linked list and operations degrade to O(n).

## Takeaway
BSTs shine when order and structure matter.`,
    },
    {
      author: aria._id,
      title: 'React Hooks without the magic',
      tags: ['react', 'frontend'],
      status: 'published',
      content: `Hooks let function components hold state and side effects.

## useState
Returns a value and a setter. Calling the setter schedules a re-render.

## useEffect
Runs after paint for sync with the outside world.

## Rules
Only call hooks at the top level of React functions.`,
    },
    {
      author: aria._id,
      title: 'RAG in plain English',
      tags: ['ai', 'rag'],
      status: 'published',
      content: `Retrieval-Augmented Generation grounds an LLM in your documents.

## Pipeline
1. Chunk documents
2. Embed chunks
3. Retrieve similar chunks for a question
4. Generate an answer with citations

On Quilio, Chat with a blog uses this idea.`,
    },
  ];

  for (const s of samples) {
    const exists = await Post.findOne({ title: s.title, author: s.author });
    if (exists) {
      console.log('Skip existing:', s.title);
      continue;
    }
    await Post.create(s);
    console.log('Created post:', s.title);
  }

  console.log('\nDone. Login: aria@quilio.app / demo1234');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
