// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Primeiro tenta popup. Se popup falhar (e.g. mobile),
 * faz redirect e recarrega a página.
 * @returns idToken (only on successful popup)
 */
export const loginWithGoogle = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return await result.user.getIdToken();
  } catch (popupError) {
    console.warn("Popup falhou, fazendo redirect:", popupError);
    await signInWithRedirect(auth, provider);
    // não retorna nada aqui porque o redirect recarrega a página
    return new Promise(() => {});
  }
};

/**
 * No mount do app, captura o resultado do redirect e
 * retorna o idToken ou null.
 */
export const handleRedirectLogin = async (): Promise<string | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await result.user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error("Erro ao tratar login via redirect:", error);
    return null;
  }
};
