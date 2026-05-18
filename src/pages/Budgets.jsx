import React, { useState, useMemo } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import useBudgets from '../hooks/useBudgets';
import useTransactions from '../hooks/useTransactions';
import { Target, Save, Trash2, AlertTriangle } from 'lucide-react';
import './Budgets.css';
import './Dashboard.css'; // Reuse glass-card styles

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'
];

export default function Budgets() {
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { transactions, loading: txLoading } = useTransactions();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate spent amounts for the current month
  const spentByCategory = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const spent = {};
    currentMonthExpenses.forEach(tx => {
      spent[tx.category] = (spent[tx.category] || 0) + tx.amount;
    });
    return spent;
  }, [transactions]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limitAmount || limitAmount <= 0) return;
    
    try {
      setSaving(true);
      // We use the category name as the document ID for simplicity and uniqueness
      const budgetRef = doc(db, `users/${currentUser.uid}/budgets`, selectedCategory);
      await setDoc(budgetRef, {
        category: selectedCategory,
        limitAmount: Number(limitAmount),
        updatedAt: new Date().toISOString()
      });
      setLimitAmount('');
    } catch (err) {
      console.error("Error saving budget", err);
      alert("Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (categoryId) => {
    if (!window.confirm("Delete this budget limit?")) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/budgets`, categoryId));
    } catch (err) {
      console.error("Error deleting budget", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (budgetsLoading || txLoading) {
    return <div className="page-loader">Loading budgets...</div>;
  }

  return (
    <div className="dashboard-page budgets-page">
      <header className="page-header">
        <h1>Monthly Budgets</h1>
        <p className="text-muted">Set spending limits and track your progress</p>
      </header>

      <div className="budgets-container">
        {/* Set Budget Form */}
        <div className="glass-card form-card">
          <div className="section-header">
            <h2>Set a Limit</h2>
          </div>
          <form onSubmit={handleSaveBudget}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Monthly Limit (₹)</label>
              <input 
                type="number" 
                required 
                min="1"
                value={limitAmount} 
                onChange={e => setLimitAmount(e.target.value)} 
                placeholder="e.g. 5000" 
              />
            </div>
            <button disabled={saving} type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </div>

        {/* Budgets List */}
        <div className="glass-card budgets-list-card">
          <div className="section-header">
            <h2>Active Budgets (Current Month)</h2>
          </div>
          
          <div className="budgets-list">
            {budgets.length === 0 ? (
              <div className="empty-state">
                <Target size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p className="text-muted">No budgets set. Create one to start tracking!</p>
              </div>
            ) : (
              budgets.map(budget => {
                const spent = spentByCategory[budget.category] || 0;
                const limit = budget.limitAmount;
                const percentage = Math.min((spent / limit) * 100, 100);
                
                let statusClass = 'status-good';
                if (percentage >= 80) statusClass = 'status-danger';
                else if (percentage >= 50) statusClass = 'status-warning';

                return (
                  <div key={budget.id} className="budget-item">
                    <div className="budget-header">
                      <div className="budget-title">
                        <h3>{budget.category}</h3>
                        {percentage >= 80 && <AlertTriangle size={16} className="text-expense pulse-anim" />}
                      </div>
                      <div className="budget-actions">
                        <button onClick={() => handleDeleteBudget(budget.id)} className="icon-btn text-muted hover-expense">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="budget-amounts">
                      <span className={`spent-amount ${percentage >= 80 ? 'text-expense' : ''}`}>
                        {formatCurrency(spent)}
                      </span>
                      <span className="limit-amount">/ {formatCurrency(limit)}</span>
                    </div>

                    <div className="progress-track">
                      <div 
                        className={`progress-fill ${statusClass}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="budget-footer">
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {(percentage).toFixed(1)}% used
                      </span>
                      {limit - spent > 0 ? (
                        <span className="text-income" style={{ fontSize: '0.8rem' }}>
                          {formatCurrency(limit - spent)} left
                        </span>
                      ) : (
                        <span className="text-expense" style={{ fontSize: '0.8rem' }}>
                          {formatCurrency(spent - limit)} over budget
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
