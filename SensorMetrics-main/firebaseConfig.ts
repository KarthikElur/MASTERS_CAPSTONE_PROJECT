// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAGD84QXJg3cfRy-gqoP0RofPqZXyFR9I",
  authDomain: "zapper-1c1ed.firebaseapp.com",
  projectId: "zapper-1c1ed",
  storageBucket: "zapper-1c1ed.firebasestorage.app",
  messagingSenderId: "657348044284",
  appId: "1:657348044284:web:8033d8eeb1ea0db563be79",
  measurementId: "G-65K6KRLBJB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
