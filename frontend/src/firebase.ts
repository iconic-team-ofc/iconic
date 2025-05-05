import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

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
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export const loginWithGoogle = async (): Promise<string | null> => {
  try {
    if (isMobile) {
      await signInWithRedirect(auth, provider);
      return null; 
    } else {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      return idToken;
    }
  } catch (error) {
    console.error('Erro ao logar:', error);
    return null;
  }
};

export const handleRedirectLogin = async (): Promise<string | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const idToken = await result.user.getIdToken();
      return idToken;
    }
    return null;
  } catch (error) {
    console.error('Erro ao tratar login via redirect:', error);
    return null;
  }
};
