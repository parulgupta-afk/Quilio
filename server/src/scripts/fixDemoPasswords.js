require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function fixDemoPasswords() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const demoEmails = [
    'aria@quilio.app',
    'marcus@quilio.app',
    'priya@quilio.app',
    'eliot@quilio.app',
    'sofia@quilio.app',
    'demo@quilio.app',
    'parulmahajan@gmail.com',
  ];

  const hash = await bcrypt.hash('demo1234', 12);
  const result = await User.updateMany(
    { email: { $in: demoEmails } },
    { $set: { passwordHash: hash } }
  );

  console.log('Updated users with password "demo1234":', result);
  await mongoose.disconnect();
}

fixDemoPasswords().catch(console.error);
