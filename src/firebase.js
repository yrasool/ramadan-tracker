import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ramadan-74897.firebaseapp.com",
  databaseURL: "https://ramadan-74897-default-rtdb.firebaseio.com",
  projectId: "ramadan-74897",
  storageBucket: "ramadan-74897.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error("Firebase not configured - set VITE_FIREBASE_* secrets in GitHub repo settings.", e.message);
}
export { db };
