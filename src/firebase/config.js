import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeQNY4hGZFQWqLMWxq0vkVfWf9OwGAAC0",
  authDomain: "expense-tracker-972e6.firebaseapp.com",
  projectId: "expense-tracker-972e6",
  storageBucket: "expense-tracker-972e6.firebasestorage.app",
  messagingSenderId: "717848970137",
  appId: "1:717848970137:web:eb1f35f4024fb4358e8908",
  measurementId: "G-9N7TFMBRM4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Setup Auth with explicit local persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("Auth persistence error:", error));

// Setup Firestore with offline caching enabled
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, googleProvider };
