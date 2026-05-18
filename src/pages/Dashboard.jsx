import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, AlertTriangle } from 'lucide-react';
import useTransactions from '../hooks/useTransactions';
import useBudgets from '../hooks/useBudgets';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { transactions, totals, loading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();

  const budgetAlerts = useMemo(() => {
    if (!budgets.length || !transactions.length) return [];
    
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

    return budgets.map(budget => {
      const spentAmount = spent[budget.category] || 0;
      const percentage = (spentAmount / budget.limitAmount) * 100;
      return { ...budget, spentAmount, percentage };
    }).filter(b => b.percentage >= 80);
  }, [budgets, transactions]);

  if (loading || budgetsLoading) {
    return <div className="page-loader">Loading your finances...</div>;
  }

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Welcome back! Here's your financial overview.</p>
      </header>

      <div className="summary-cards">
        <div className="glass-card summary-card balance-card">
          <div className="card-icon">
            <Wallet size={24} />
          </div>
          <div className="card-content">
            <h3>Total Balance</h3>
            <h2 className="text-gradient">{formatCurrency(totals.balance)}</h2>
          </div>
        </div>

        <div className="glass-card summary-card income-card">
          <div className="card-icon">
            <ArrowUpRight size={24} />
          </div>
          <div className="card-content">
            <h3>Total Income</h3>
            <h2 className="text-income">{formatCurrency(totals.income)}</h2>
          </div>
        </div>

        <div className="glass-card summary-card expense-card">
          <div className="card-icon">
            <ArrowDownRight size={24} />
          </div>
          <div className="card-content">
            <h3>Total Expense</h3>
            <h2 className="text-expense">{formatCurrency(totals.expense)}</h2>
          </div>
        </div>
      </div>

      <div className="recent-transactions-section">
        {budgetAlerts.length > 0 && (
          <div className="budget-alerts-widget" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle className="text-expense pulse-anim" size={20} />
              Budget Alerts
            </h3>
            {budgetAlerts.map(alert => (
              <div key={alert.id} className="alert-item">
                <AlertTriangle size={18} className="text-expense" />
                <div className="alert-text">
                  You have used <strong>{alert.percentage.toFixed(0)}%</strong> of your <strong>{alert.category}</strong> budget.
                </div>
                <Link to="/budgets" className="text-accent hover-accent" style={{ fontSize: '0.85rem' }}>View</Link>
              </div>
            ))}
          </div>
        )}

        <div className="section-header">
          <h2>Recent Transactions</h2>
          <Link to="/history" className="view-all-link">View All</Link>
        </div>

        <div className="glass-card transactions-list">
          {recentTransactions.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted">No transactions found.</p>
              <Link to="/add" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                Add New
              </Link>
            </div>
          ) : (
            recentTransactions.map(tx => (
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
                <div className={`tx-amount ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
