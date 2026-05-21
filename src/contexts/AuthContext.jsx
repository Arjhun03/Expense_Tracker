import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure user document exists in Firestore
  const ensureUserDoc = async (user) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error ensuring user document exists in Firestore:", err);
      // Catch error so authentication flow is not blocked
    }
  };

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => ensureUserDoc(userCredential.user));
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  const [redirectError, setRedirectError] = useState(null);

  async function googleSignIn() {
    try {
      setRedirectError(null);
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      return result.user;
    } catch (error) {
      console.warn("Popup sign-in failed or blocked, trying redirect fallback...", error);
      // Fallback to redirect if popup is blocked, closed, or unsupported
      if (
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/operation-not-supported' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        try {
          return await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          console.error("Redirect sign-in initialization failed:", redirectErr);
          throw redirectErr;
        }
      }
      throw error;
    }
  }

  useEffect(() => {
    // Process redirect result if any
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          await ensureUserDoc(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        setRedirectError(error);
      });

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    googleSignIn,
    redirectError,
    setRedirectError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
