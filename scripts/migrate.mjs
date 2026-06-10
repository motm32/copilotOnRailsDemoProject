/**
 * Database migration and seed script for local development.
 * Runs SQL migrations from src/functions/seeds/migrations/ and inserts seed data.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const migrationsDir = join(rootDir, 'src', 'functions', 'seeds', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    await client.query(sql);
  }
}

async function seedData() {
  const fixturesPath = join(rootDir, 'src', 'functions', 'seeds', 'fixtures', 'seed-data.json');
  const data = JSON.parse(readFileSync(fixturesPath, 'utf-8'));

  // Seed users (with bcrypt-like hash placeholder for local dev)
  for (const user of data.users) {
    await client.query(
      `INSERT INTO users (id, email, display_name, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, user.email, user.displayName, '$2b$10$localdevhashplaceholder000000000000000000000000']
    );
  }

  // Seed pairs
  for (const pair of data.pairs) {
    await client.query(
      `INSERT INTO pairs (id, user1_id, user2_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [pair.id, pair.user1Id, pair.user2Id]
    );
  }

  // Seed photos
  for (const photo of data.photos) {
    await client.query(
      `INSERT INTO photos (id, uploader_id, pair_id, blob_url, filename, mime_type, size_bytes, caption)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [photo.id, photo.uploaderId, photo.pairId, photo.blobUrl, photo.filename, photo.mimeType, photo.sizeBytes, photo.caption || null]
    );
  }

  console.log('Seed data inserted.');
}

async function main() {
  await client.connect();
  try {
    await runMigrations();
    await seedData();
    console.log('Migration and seeding complete.');
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
