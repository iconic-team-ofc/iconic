// src/config/firebase.config.ts
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  // Decode do Base64 para string JSON
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
  serviceAccount = JSON.parse(decoded);
} else {
  // Fallback: lê do caminho físico (útil para desenvolvimento local)
  const path = process.env.FIREBASE_CREDENTIALS_PATH || 'src/config/firebase-service-account.json';
  serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), path), 'utf-8'),
  );
}

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
