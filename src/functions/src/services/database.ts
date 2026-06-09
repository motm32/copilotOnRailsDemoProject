import pg from 'pg';
import type { User, PublicUser, Pair, PairInvite, Photo, PhotoWithUploader } from '@app/shared';
import type { IDatabaseService } from './interfaces/database.js';
import type { AppConfig } from './config.js';

const { Pool } = pg;

export class PostgresDatabase implements IDatabaseService {
    private pool: pg.Pool;

    constructor(config: AppConfig) {
        this.pool = new Pool({ connectionString: config.databaseUrl });
    }

    async createUser(email: string, displayName: string, passwordHash: string): Promise<User> {
        const result = await this.pool.query(
            `INSERT INTO users (email, display_name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
            [email, displayName, passwordHash]
        );
        return this.mapUser(result.rows[0]);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    async getUserById(id: string): Promise<User | null> {
        const result = await this.pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    async getPublicUser(id: string): Promise<PublicUser | null> {
        const result = await this.pool.query(
            `SELECT id, email, display_name, avatar_url FROM users WHERE id = $1`,
            [id]
        );
        if (!result.rows[0]) return null;
        const row = result.rows[0];
        return { id: row.id, email: row.email, displayName: row.display_name, avatarUrl: row.avatar_url };
    }

    async createPair(user1Id: string, user2Id: string): Promise<Pair> {
        const result = await this.pool.query(
            `INSERT INTO pairs (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
            [user1Id, user2Id]
        );
        return this.mapPair(result.rows[0]);
    }

    async getPairByUserId(userId: string): Promise<Pair | null> {
        const result = await this.pool.query(
            `SELECT * FROM pairs WHERE user1_id = $1 OR user2_id = $1`,
            [userId]
        );
        return result.rows[0] ? this.mapPair(result.rows[0]) : null;
    }

    async createInvite(fromUserId: string, toEmail: string): Promise<PairInvite> {
        const result = await this.pool.query(
            `INSERT INTO pair_invites (from_user_id, to_email, status) VALUES ($1, $2, 'pending') RETURNING *`,
            [fromUserId, toEmail]
        );
        return this.mapInvite(result.rows[0]);
    }

    async getInviteById(id: string): Promise<PairInvite | null> {
        const result = await this.pool.query(`SELECT * FROM pair_invites WHERE id = $1`, [id]);
        return result.rows[0] ? this.mapInvite(result.rows[0]) : null;
    }

    async acceptInvite(inviteId: string): Promise<PairInvite> {
        const result = await this.pool.query(
            `UPDATE pair_invites SET status = 'accepted' WHERE id = $1 RETURNING *`,
            [inviteId]
        );
        return this.mapInvite(result.rows[0]);
    }

    async getPendingInviteForUser(email: string): Promise<PairInvite | null> {
        const result = await this.pool.query(
            `SELECT * FROM pair_invites WHERE to_email = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
            [email]
        );
        return result.rows[0] ? this.mapInvite(result.rows[0]) : null;
    }

    async createPhoto(photo: Omit<Photo, 'id' | 'createdAt' | 'caption'>): Promise<Photo> {
        const result = await this.pool.query(
            `INSERT INTO photos (uploader_id, pair_id, blob_url, filename, mime_type, size_bytes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [photo.uploaderId, photo.pairId, photo.blobUrl, photo.filename, photo.mimeType, photo.sizeBytes]
        );
        return this.mapPhoto(result.rows[0]);
    }

    async getPhotosByPairId(pairId: string): Promise<PhotoWithUploader[]> {
        const result = await this.pool.query(
            `SELECT p.*, u.display_name as uploader_name FROM photos p JOIN users u ON p.uploader_id = u.id WHERE p.pair_id = $1 ORDER BY p.created_at DESC`,
            [pairId]
        );
        return result.rows.map((row) => ({ ...this.mapPhoto(row), uploaderName: row.uploader_name }));
    }

    async getPhotoById(id: string): Promise<Photo | null> {
        const result = await this.pool.query(`SELECT * FROM photos WHERE id = $1`, [id]);
        return result.rows[0] ? this.mapPhoto(result.rows[0]) : null;
    }

    async deletePhoto(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM photos WHERE id = $1`, [id]);
    }

    async updatePhotoCaption(id: string, caption: string): Promise<Photo> {
        const result = await this.pool.query(
            `UPDATE photos SET caption = $1 WHERE id = $2 RETURNING *`,
            [caption, id]
        );
        return this.mapPhoto(result.rows[0]);
    }

    async transaction<T>(fn: (client: unknown) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async health(): Promise<boolean> {
        try {
            await this.pool.query('SELECT 1');
            return true;
        } catch {
            return false;
        }
    }

    private mapUser(row: Record<string, unknown>): User {
        return {
            id: row.id as string,
            email: row.email as string,
            displayName: row.display_name as string,
            passwordHash: row.password_hash as string,
            avatarUrl: (row.avatar_url as string) || null,
            createdAt: (row.created_at as Date).toISOString(),
            updatedAt: (row.updated_at as Date).toISOString(),
        };
    }

    private mapPair(row: Record<string, unknown>): Pair {
        return {
            id: row.id as string,
            user1Id: row.user1_id as string,
            user2Id: row.user2_id as string,
            createdAt: (row.created_at as Date).toISOString(),
        };
    }

    private mapInvite(row: Record<string, unknown>): PairInvite {
        return {
            id: row.id as string,
            fromUserId: row.from_user_id as string,
            toEmail: row.to_email as string,
            status: row.status as 'pending' | 'accepted' | 'declined',
            createdAt: (row.created_at as Date).toISOString(),
        };
    }

    private mapPhoto(row: Record<string, unknown>): Photo {
        return {
            id: row.id as string,
            uploaderId: row.uploader_id as string,
            pairId: row.pair_id as string,
            blobUrl: row.blob_url as string,
            filename: row.filename as string,
            mimeType: row.mime_type as string,
            sizeBytes: row.size_bytes as number,
            caption: (row.caption as string) || null,
            createdAt: (row.created_at as Date).toISOString(),
        };
    }
}
