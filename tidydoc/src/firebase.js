// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Remplacez ces valeurs par celles de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_sXwOTYxVJqn7k3GOmvWlto49BPRfNfo",
  authDomain: "tidy-8771f.firebaseapp.com",
  projectId: "tidy-8771f",
  storageBucket: "tidy-8771f.firebasestorage.app",
  messagingSenderId: "894050244273",
  appId: "1:894050244273:web:f4faff06769d0301533490",
  measurementId: "G-LZ9C4Z15YG"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser et exporter l'auth
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;