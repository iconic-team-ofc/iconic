// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCq_C9HbyW7SIfn-_n12iSmu0YVeIqgxKI",
    authDomain: "iconic-8fb9f.firebaseapp.com",
    projectId: "iconic-8fb9f",
    storageBucket: "iconic-8fb9f.firebasestorage.app",
    messagingSenderId: "205376783774",
    appId: "1:205376783774:web:d3845aa0a15e933429028f",
    measurementId: "G-98N4LQ7F1B"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Erro ao logar:', error);
    return null;
  }
};
