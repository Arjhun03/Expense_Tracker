import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const docRef = doc(db, `users/${currentUser.uid}/preferences`, 'settings');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Initialize default settings if they don't exist
        const defaultSettings = {
          reminderInterval: 'never', // 'daily', '3days', 'weekly', 'never'
          lastTransactionDate: new Date().toISOString(),
          notificationsEnabled: false
        };
        setDoc(docRef, defaultSettings);
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateSettings = async (newSettings) => {
    if (!currentUser) return;
    const docRef = doc(db, `users/${currentUser.uid}/preferences`, 'settings');
    await updateDoc(docRef, newSettings);
  };

  return { settings, loading, updateSettings };
}
