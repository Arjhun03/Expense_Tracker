import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/transactions`),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === 'income') {
      acc.income += Number(curr.amount);
      acc.balance += Number(curr.amount);
    } else {
      acc.expense += Number(curr.amount);
      acc.balance -= Number(curr.amount);
    }
    return acc;
  }, { balance: 0, income: 0, expense: 0 });

  return { transactions, totals, loading };
}
