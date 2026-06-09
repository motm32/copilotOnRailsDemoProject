import { createHmac, timingSafeEqual } from "node:crypto";
import type { IAuthService, TokenPayload } from "./interfaces/auth.js";

const TOKEN_EXPIRY_SECONDS = 86400; // 24 hours

export class MockAuthService implements IAuthService {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  generateToken(userId: string, email: string): string {
    const header = { alg: "HS256", typ: "JWT" };
    const payload: TokenPayload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);

      const sigBuffer = Buffer.from(signature, "base64url");
      const expectedBuffer = Buffer.from(expectedSignature, "base64url");

      if (sigBuffer.length !== expectedBuffer.length) return null;
      if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

      const payload = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf-8")
      ) as TokenPayload;

      if (payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload;
    } catch {
      return null;
    }
  }

  private sign(data: string): string {
    return createHmac("sha256", this.secret)
      .update(data)
      .digest("base64url");
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str).toString("base64url");
  }
}
