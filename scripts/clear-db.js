#!/usr/bin/env node
/**
 * scripts/clear-db.js
 * Safely clears the entire MongoDB database configured by MONGODB_URI.
 * Usage: `npm run clear-db`
 * WARNING: This is destructive and irreversible. Use only in development/testing.
 */

const readline = require('readline');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env.local if present
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment (.env.local). Aborting.');
  process.exit(1);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

async function main() {
  console.log('This will DROP the entire MongoDB database pointed to by MONGODB_URI:');
  console.log(MONGODB_URI);
  const ans = String(await ask('Type the word DELETE to confirm: ')).trim();
  if (ans !== 'DELETE') {
    console.log('Confirmation failed — aborting.');
    process.exit(0);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DBNAME });

  try {
    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully.');
  } catch (err) {
    console.error('Error while dropping database:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
