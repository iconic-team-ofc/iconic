// src/config/firebase.config.ts
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Pega o caminho do .env
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH || 'src/config/firebase-service-account.json';

// Lê e parseia o JSON
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), serviceAccountPath), 'utf-8'),
);

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
