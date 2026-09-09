import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateKeyPairSync } from 'crypto';

let cachedPrivateKey: string | null = null;
let cachedPublicKey: string | null = null;

export function getPublicKey(): string {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  if (process.env.JWT_PUBLIC_KEY) {
    cachedPublicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    return cachedPublicKey;
  }

  const possiblePaths = [
    join(process.cwd(), 'keys', 'public.pem'),
    join(process.cwd(), 'keys', 'public.key'),
    join(process.cwd(), '..', '..', 'keys', 'public.pem'),
    join(process.cwd(), '..', '..', 'keys', 'public.key'),
  ];

  for (const keyPath of possiblePaths) {
    if (existsSync(keyPath)) {
      cachedPublicKey = readFileSync(keyPath, 'utf8');
      return cachedPublicKey;
    }
  }

  // Fallback for dev mode if no key file exists: auto-generate ephemeral pair
  ensureDevKeys();
  return cachedPublicKey!;
}

export function getPrivateKey(): string {
  if (cachedPrivateKey) {
    return cachedPrivateKey;
  }

  if (process.env.JWT_PRIVATE_KEY) {
    cachedPrivateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
    return cachedPrivateKey;
  }

  const possiblePaths = [
    join(process.cwd(), 'keys', 'private.pem'),
    join(process.cwd(), 'keys', 'private.key'),
    join(process.cwd(), '..', '..', 'keys', 'private.pem'),
    join(process.cwd(), '..', '..', 'keys', 'private.key'),
  ];

  for (const keyPath of possiblePaths) {
    if (existsSync(keyPath)) {
      cachedPrivateKey = readFileSync(keyPath, 'utf8');
      return cachedPrivateKey;
    }
  }

  // Fallback for dev mode if no key file exists: auto-generate ephemeral pair
  ensureDevKeys();
  return cachedPrivateKey!;
}

function ensureDevKeys() {
  if (cachedPrivateKey && cachedPublicKey) return;

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  cachedPrivateKey = privateKey;
  cachedPublicKey = publicKey;
}
