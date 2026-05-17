import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import useTransactions from '../hooks/useTransactions';
import { ArrowUpRight, ArrowDownRight, Trash2, Edit2, X, Save } from 'lucide-react';
import './Dashboard.css';

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Salary', 'Bills', 'Entertainment', 'Health', 'Other'
];

export default function History() {
  const { transactions, loading } = useTransactions();
  const { currentUser } = useAuth();
  
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', amount: '', category: '', date: '', type: '' });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/transactions`, id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx.id);
    setEditForm({
      title: tx.title,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      type: tx.type
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const txRef = doc(db, `users/${currentUser.uid}/transactions`, editingTx);
      await updateDoc(txRef, {
        ...editForm,
        amount: Number(editForm.amount)
      });
      setEditingTx(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  if (loading) return <div className="page-loader">Loading history...</div>;

  return (
    <div className="dashboard-page relative">
      <header className="page-header">
        <h1>Transaction History</h1>
        <p className="text-muted">View, edit, or delete your past transactions</p>
      </header>

      <div className="glass-card transactions-list">
        {transactions.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className="tx-info">
                <div className={`tx-icon ${tx.type === 'income' ? 'income-icon' : 'expense-icon'}`}>
                  {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <h4>{tx.title}</h4>
                  <span className="tx-category">{tx.category} • {tx.date}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div className={`tx-amount ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                
                <div className="tx-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditClick(tx)} className="icon-btn text-muted hover-accent">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(tx.id)} className="icon-btn text-muted hover-expense">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="modal-overlay">
          <div className="glass-card form-card modal-content">
            <div className="section-header">
              <h2>Edit Transaction</h2>
              <button onClick={() => setEditingTx(null)} className="icon-btn text-muted"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Transaction Type</label>
                <div className="radio-group">
                  <label className={`radio-option ${editForm.type === 'income' ? 'selected income' : ''}`}>
                    <input type="radio" value="income" checked={editForm.type === 'income'} onChange={(e) => setEditForm({...editForm, type: e.target.value})} />
                    Income
                  </label>
                  <label className={`radio-option ${editForm.type === 'expense' ? 'selected expense' : ''}`}>
                    <input type="radio" value="expense" checked={editForm.type === 'expense'} onChange={(e) => setEditForm({...editForm, type: e.target.value})} />
                    Expense
                  </label>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" required min="0" step="0.01" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Save size={18} /> Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
