import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scrypt, randomBytes } from "node:crypto";
import { runMigration } from "../migrations/001-initial-schema.js";

const { Pool } = pg;

interface SeedUser {
  id: string;
  email: string;
  displayName: string;
  password: string;
}

interface SeedCouple {
  id: string;
  user1Id: string;
  user2Id: string;
}

interface SeedPhoto {
  id: string;
  uploadedBy: string;
  blobUrl: string;
  caption: string;
  mimeType: string;
  sizeBytes: number;
}

interface SeedData {
  users: SeedUser[];
  couple: SeedCouple;
  photos: SeedPhoto[];
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32);
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function seed(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_URL ??
    "postgresql://localdev:localdevpassword@localhost:5432/scrapbookdb";

  // Run migrations first
  await runMigration(databaseUrl);

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const seedDataPath = join(currentDir, "fixtures", "seed-data.json");
  const seedData: SeedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Idempotent: check if data already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [seedData.users[0].id]
    );

    if (existingUser.rows.length > 0) {
      console.log("Seed data already exists, skipping...");
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert users
      for (const user of seedData.users) {
        const passwordHash = await hashPassword(user.password);
        await client.query(
          `INSERT INTO users (id, email, display_name, password_hash, couple_id)
           VALUES ($1, $2, $3, $4, NULL)`,
          [user.id, user.email, user.displayName, passwordHash]
        );
      }

      // Insert couple
      await client.query(
        `INSERT INTO couples (id, user1_id, user2_id)
         VALUES ($1, $2, $3)`,
        [seedData.couple.id, seedData.couple.user1Id, seedData.couple.user2Id]
      );

      // Update users with couple_id
      for (const user of seedData.users) {
        await client.query(
          `UPDATE users SET couple_id = $1 WHERE id = $2`,
          [seedData.couple.id, user.id]
        );
      }

      // Insert photos
      for (const photo of seedData.photos) {
        await client.query(
          `INSERT INTO photos (id, couple_id, uploaded_by, blob_url, caption, mime_type, size_bytes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            photo.id,
            seedData.couple.id,
            photo.uploadedBy,
            photo.blobUrl,
            photo.caption,
            photo.mimeType,
            photo.sizeBytes,
          ]
        );
      }

      await client.query("COMMIT");
      console.log("Seed data inserted successfully");
      console.log(`  - ${seedData.users.length} users`);
      console.log(`  - 1 couple`);
      console.log(`  - ${seedData.photos.length} photos`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
