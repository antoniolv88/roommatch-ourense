// lib/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
  apiKey: "AIzaSyAg6M57PiW3DaqbUl5qTQFLQlv0kfgezAU",
  authDomain: "roommatch-ourense.firebaseapp.com",
  projectId: "roommatch-ourense",
  storageBucket: "roommatch-ourense.firebasestorage.app",
  messagingSenderId: "1082393028932",
  appId: "1:1082393028932:web:84cb47dfa01ce7ac594f11"
};



const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // <-- aquí exportas storage