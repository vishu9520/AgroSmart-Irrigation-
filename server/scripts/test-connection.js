// Quick MongoDB Atlas connection test using Mongoose
// Usage: from server/: npm run test:db

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in server/.env');
    process.exit(1);
  }

  console.log('Testing connection to MongoDB...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✔ Connected via Mongoose');
    const res = await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✔ Ping response:', res);
    console.log('DB name:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('✖ Connection failed');
    console.error(err);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

main();

