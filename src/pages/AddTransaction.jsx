import React, { useState } from 'react';

import { collection, addDoc, doc, getDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUpRight, ArrowDownRight, Save } from 'lucide-react';
import './Dashboard.css'; // Reusing some common layout styles

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Salary', 'Bills', 'Entertainment', 'Health', 'Other'
];

export default function AddTransaction() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) return;

    try {
      setLoading(true);
      
      const newTransaction = {
        title,
        amount: Number(amount),
        type,
        category,
        date,
        createdAt: new Date().toISOString()
      };

      // 1. Await the document write with a 1.5-second timeout fallback
      // This ensures we show "Saving..." briefly during the write, but never get stuck if Firestore hangs
      try {
        await Promise.race([
          addDoc(collection(db, `users/${currentUser.uid}/transactions`), newTransaction),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        setSuccess(true);
      } catch (err) {
        if (err.message === 'timeout') {
          console.warn("Firestore write timed out, transaction queued offline.");
          // Treat as success optimistically because Firestore's offline queue will write it once online
          setSuccess(true);
        } else {
          throw err;
        }
      }

      // 2. Clear inputs immediately after success or offline queuing
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeout(() => setSuccess(false), 4000);

      // 3. Update settings and check budget limits in the background (NOT awaited in the main UI thread)
      (async () => {
        try {
          const settingsRef = doc(db, `users/${currentUser.uid}/preferences`, 'settings');
          await setDoc(settingsRef, {
            lastTransactionDate: new Date().toISOString()
          }, { merge: true });

          if (type === 'expense') {
            const budgetRef = doc(db, `users/${currentUser.uid}/budgets`, category);
            const budgetSnap = await getDoc(budgetRef);

            if (budgetSnap.exists()) {
              const budgetLimit = budgetSnap.data().limitAmount;

              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

              const q = query(
                collection(db, `users/${currentUser.uid}/transactions`),
                where('type', '==', 'expense'),
                where('category', '==', category),
                where('date', '>=', startOfMonth)
              );

              const querySnap = await getDocs(q);
              let spent = 0;
              querySnap.forEach(doc => {
                spent += doc.data().amount;
              });

              if (spent > budgetLimit && Notification.permission === "granted") {
                new Notification("Budget Alert! 🚨", {
                  body: `You have exceeded your ${category} budget of ₹${budgetLimit}! Total spent: ₹${spent}.`,
                });
              }
            }
          }
        } catch (bgErr) {
          console.error("Error in background database operations: ", bgErr);
        }
      })();

    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add transaction. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Add Transaction</h1>
        <p className="text-muted">Record a new income or expense</p>
      </header>

      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Transaction saved successfully! Ready for the next entry.
        </div>
      )}

      <div className="glass-card form-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Transaction Type</label>
            <div className="radio-group">
              <label className={`radio-option ${type === 'income' ? 'selected income' : ''}`}>
                <input 
                  type="radio" 
                  value="income" 
                  checked={type === 'income'} 
                  onChange={(e) => setType(e.target.value)} 
                />
                <ArrowUpRight size={18} />
                Income
              </label>
              <label className={`radio-option ${type === 'expense' ? 'selected expense' : ''}`}>
                <input 
                  type="radio" 
                  value="expense" 
                  checked={type === 'expense'} 
                  onChange={(e) => setType(e.target.value)} 
                />
                <ArrowDownRight size={18} />
                Expense
              </label>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Title / Description</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g., Grocery Shopping" 
              />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
