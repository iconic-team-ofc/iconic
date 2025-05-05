<<<<<<< Updated upstream
// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
=======
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Erro ao logar:', error);
    return null;
  }
};
=======
    return await result.user.getIdToken();
  } catch (error: any) {
    console.warn("Popup sign-in failed, falling back to redirect:", error);
    signInWithRedirect(auth, provider);
    return null;
  }
};

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
>>>>>>> Stashed changes
