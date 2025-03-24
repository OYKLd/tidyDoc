// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Remplacez ces valeurs par celles de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD77K9m19kHtfv5zrgvDIoOJfjA5iYg4Lw",
  authDomain: "tidydoc.firebaseapp.com",
  projectId: "tidydoc",
  storageBucket: "tidydoc.firebasestorage.app",
  messagingSenderId: "167012453317",
  appId: "1:167012453317:web:7baf01fc2c62c26f3f59ac",
  measurementId: "G-QLY5RYKH8L"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser et exporter l'auth
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;