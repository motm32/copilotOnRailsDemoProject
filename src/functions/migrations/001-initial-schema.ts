import pg from "pg";

const { Pool } = pg;

const MIGRATION_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  couple_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_couple_id ON users (couple_id);

-- Couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_different_users CHECK (user1_id != user2_id)
);

-- Add FK from users.couple_id → couples.id (deferred to avoid circular dependency)
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS fk_users_couple_id;
ALTER TABLE users
  ADD CONSTRAINT fk_users_couple_id
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE SET NULL;

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes (code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON invite_codes (created_by);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  caption TEXT,
  mime_type VARCHAR(50) NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_couple_id ON photos (couple_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos (uploaded_by);
`;

export async function runMigration(databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query(MIGRATION_SQL);
    console.log("Migration 001-initial-schema completed successfully");
  } finally {
    await pool.end();
  }
}

// Allow running directly
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && process.argv[1]?.includes("001-initial-schema")) {
  runMigration(dbUrl)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
