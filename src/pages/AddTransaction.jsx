import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
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

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) return;

    try {
      setLoading(true);
      await addDoc(collection(db, `users/${currentUser.uid}/transactions`), {
        title,
        amount: Number(amount),
        type,
        category,
        date,
        createdAt: new Date().toISOString()
      });
      navigate('/');
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add transaction");
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
