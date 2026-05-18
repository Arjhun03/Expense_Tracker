import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/budgets`)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const budgetList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBudgets(budgetList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching budgets:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { budgets, loading };
}
