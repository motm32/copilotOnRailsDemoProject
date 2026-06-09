import pg from "pg";
import type { User, Couple, Photo, InviteCode } from "../../../shared/types/entities.js";
import type { IDatabaseService } from "./interfaces/database.js";

const { Pool } = pg;
type PoolClient = pg.PoolClient;

export class PostgresDatabaseService implements IDatabaseService {
  private pool: pg.Pool;
  private client: PoolClient | null;

  constructor(connectionString: string, client?: PoolClient) {
    this.pool = new Pool({ connectionString });
    this.client = client ?? null;
  }

  private get db() {
    return this.client ?? this.pool;
  }

  async createUser(user: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
    const result = await this.db.query<User>(
      `INSERT INTO users (id, email, display_name, password_hash, couple_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name AS "displayName", password_hash AS "passwordHash",
                 couple_id AS "coupleId", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [user.id, user.email, user.displayName, user.passwordHash, user.coupleId]
    );
    return result.rows[0];
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.query<User>(
      `SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash",
              couple_id AS "coupleId", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<User>(
      `SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash",
              couple_id AS "coupleId", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async updateUser(
    id: string,
    updates: Partial<Pick<User, "coupleId" | "displayName">>
  ): Promise<User> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.coupleId !== undefined) {
      setClauses.push(`couple_id = $${paramIndex++}`);
      values.push(updates.coupleId);
    }
    if (updates.displayName !== undefined) {
      setClauses.push(`display_name = $${paramIndex++}`);
      values.push(updates.displayName);
    }
    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.query<User>(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, email, display_name AS "displayName", password_hash AS "passwordHash",
                 couple_id AS "coupleId", created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0];
  }

  async createCouple(couple: Omit<Couple, "createdAt">): Promise<Couple> {
    const result = await this.db.query<Couple>(
      `INSERT INTO couples (id, user1_id, user2_id)
       VALUES ($1, $2, $3)
       RETURNING id, user1_id AS "user1Id", user2_id AS "user2Id", created_at AS "createdAt"`,
      [couple.id, couple.user1Id, couple.user2Id]
    );
    return result.rows[0];
  }

  async getCoupleById(id: string): Promise<Couple | null> {
    const result = await this.db.query<Couple>(
      `SELECT id, user1_id AS "user1Id", user2_id AS "user2Id", created_at AS "createdAt"
       FROM couples WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async getCoupleByUserId(userId: string): Promise<Couple | null> {
    const result = await this.db.query<Couple>(
      `SELECT id, user1_id AS "user1Id", user2_id AS "user2Id", created_at AS "createdAt"
       FROM couples WHERE user1_id = $1 OR user2_id = $1`,
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async createInviteCode(invite: Omit<InviteCode, "createdAt">): Promise<InviteCode> {
    const result = await this.db.query<InviteCode>(
      `INSERT INTO invite_codes (id, code, created_by, used_by, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, code, created_by AS "createdBy", used_by AS "usedBy",
                 expires_at AS "expiresAt", created_at AS "createdAt"`,
      [invite.id, invite.code, invite.createdBy, invite.usedBy, invite.expiresAt]
    );
    return result.rows[0];
  }

  async getInviteCodeByCode(code: string): Promise<InviteCode | null> {
    const result = await this.db.query<InviteCode>(
      `SELECT id, code, created_by AS "createdBy", used_by AS "usedBy",
              expires_at AS "expiresAt", created_at AS "createdAt"
       FROM invite_codes WHERE code = $1`,
      [code]
    );
    return result.rows[0] ?? null;
  }

  async markInviteCodeUsed(id: string, usedBy: string): Promise<void> {
    await this.db.query(
      `UPDATE invite_codes SET used_by = $1 WHERE id = $2`,
      [usedBy, id]
    );
  }

  async getActiveInviteByUser(userId: string): Promise<InviteCode | null> {
    const result = await this.db.query<InviteCode>(
      `SELECT id, code, created_by AS "createdBy", used_by AS "usedBy",
              expires_at AS "expiresAt", created_at AS "createdAt"
       FROM invite_codes
       WHERE created_by = $1 AND used_by IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async createPhoto(photo: Omit<Photo, "createdAt">): Promise<Photo> {
    const result = await this.db.query<Photo>(
      `INSERT INTO photos (id, couple_id, uploaded_by, blob_url, caption, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, couple_id AS "coupleId", uploaded_by AS "uploadedBy", blob_url AS "blobUrl",
                 caption, mime_type AS "mimeType", size_bytes AS "sizeBytes", created_at AS "createdAt"`,
      [photo.id, photo.coupleId, photo.uploadedBy, photo.blobUrl, photo.caption, photo.mimeType, photo.sizeBytes]
    );
    return result.rows[0];
  }

  async getPhotoById(id: string): Promise<Photo | null> {
    const result = await this.db.query<Photo>(
      `SELECT id, couple_id AS "coupleId", uploaded_by AS "uploadedBy", blob_url AS "blobUrl",
              caption, mime_type AS "mimeType", size_bytes AS "sizeBytes", created_at AS "createdAt"
       FROM photos WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async getPhotosByCoupleId(coupleId: string): Promise<Photo[]> {
    const result = await this.db.query<Photo>(
      `SELECT id, couple_id AS "coupleId", uploaded_by AS "uploadedBy", blob_url AS "blobUrl",
              caption, mime_type AS "mimeType", size_bytes AS "sizeBytes", created_at AS "createdAt"
       FROM photos WHERE couple_id = $1 ORDER BY created_at DESC`,
      [coupleId]
    );
    return result.rows;
  }

  async deletePhoto(id: string): Promise<void> {
    await this.db.query(`DELETE FROM photos WHERE id = $1`, [id]);
  }

  async transaction<T>(fn: (client: IDatabaseService) => Promise<T>): Promise<T> {
    const poolClient = await this.pool.connect();
    try {
      await poolClient.query("BEGIN");
      const txService = new PostgresDatabaseService(
        "",
        poolClient
      );
      const result = await fn(txService);
      await poolClient.query("COMMIT");
      return result;
    } catch (err) {
      await poolClient.query("ROLLBACK");
      throw err;
    } finally {
      poolClient.release();
    }
  }

  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      await this.pool.query("SELECT 1");
      return { status: "healthy", latencyMs: Date.now() - start };
    } catch {
      return { status: "unhealthy", latencyMs: Date.now() - start };
    }
  }
}
