import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });

  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
}
