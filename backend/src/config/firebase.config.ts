// src/config/firebase.config.ts
import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, isAbsolute } from 'path';

let serviceAccount: admin.ServiceAccount | undefined;

// 1. Tenta carregar do ENV Base64 primeiro (mais seguro para produção/serverless)
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64',
    ).toString('utf-8');
    serviceAccount = JSON.parse(decoded);
    console.log('[Firebase] Service account carregada via BASE64.');
  } catch (err) {
    throw new Error(
      'Erro ao decodificar FIREBASE_SERVICE_ACCOUNT_BASE64: ' + err,
    );
  }
} else {
  // 2. Fallback: caminho do arquivo físico (útil para desenvolvimento local)
  const path =
    process.env.FIREBASE_CREDENTIALS_PATH ||
    'src/config/firebase-service-account.json';
  // Resolve path absoluto se não for
  const absPath = isAbsolute(path) ? path : join(process.cwd(), path);
  if (!existsSync(absPath)) {
    throw new Error(
      `[Firebase] Service account file não encontrado: ${absPath}`,
    );
  }
  try {
    serviceAccount = JSON.parse(readFileSync(absPath, 'utf-8'));
    console.log('[Firebase] Service account carregada via arquivo.');
  } catch (err) {
    throw new Error('Erro ao ler o arquivo de service account: ' + err);
  }
}

// Inicializa o Firebase Admin apenas se ainda não inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount!),
    projectId: process.env.FIREBASE_PROJECT_ID, // opcional, pode ser omitido se não precisar
  });
}

export default admin;
