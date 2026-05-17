import React, { useMemo } from 'react';
import useTransactions from '../hooks/useTransactions';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export default function Analytics() {
  const { transactions, loading } = useTransactions();

  // Process data for Category Pie Chart (Expenses Only)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Process data for Income vs Expense Bar Chart
  const incomeVsExpenseData = useMemo(() => {
    const totals = transactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.Income += curr.amount;
      else acc.Expense += curr.amount;
      return acc;
    }, { Income: 0, Expense: 0 });

    return [
      { name: 'Income vs Expense', Income: totals.Income, Expense: totals.Expense }
    ];
  }, [transactions]);

  if (loading) return <div className="page-loader">Loading analytics...</div>;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Analytics</h1>
        <p className="text-muted">Visualize your financial data</p>
      </header>

      {transactions.length === 0 ? (
        <div className="glass-card empty-state">
          <p className="text-muted">No data available for analytics yet.</p>
        </div>
      ) : (
        <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          
          <div className="glass-card form-card" style={{ width: '100%', maxWidth: 'none', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                  contentStyle={{ backgroundColor: '#131a2a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card form-card" style={{ width: '100%', maxWidth: 'none', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Income vs Expense Overview</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip 
                  formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                  contentStyle={{ backgroundColor: '#131a2a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}
