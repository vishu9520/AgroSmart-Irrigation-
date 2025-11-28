// Ping MongoDB Atlas using the official MongoDB Node.js driver.
// Uses MONGODB_URI from server/.env

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in server/.env');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Prefer IPv4 to avoid some IPv6/DNS edge cases
  family: 4,
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('Connection failed:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

run();
