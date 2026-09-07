import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

function generateKeys() {
  const keysDir = join(process.cwd(), 'keys');

  if (!existsSync(keysDir)) {
    mkdirSync(keysDir, { recursive: true });
  }

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

  const privateKeyPath = join(keysDir, 'private.pem');
  const publicKeyPath = join(keysDir, 'public.pem');

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log(`RSA key pair successfully generated in ${keysDir}`);
  console.log(`- Private key: ${privateKeyPath}`);
  console.log(`- Public key: ${publicKeyPath}`);
}

generateKeys();
