const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

const tryConnect = async (retries = 20, delayMs = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new Client({ connectionString });
      await client.connect();
      await client.end();
      console.log('Database is ready')
      return;
    } catch (err) {
      console.log(`Database not ready yet (attempt ${i + 1}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error('Timed out waiting for database')
  process.exit(1);
}

tryConnect();
