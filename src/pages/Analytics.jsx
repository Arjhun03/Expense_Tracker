import React, { useMemo, useState } from 'react';
import useTransactions from '../hooks/useTransactions';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export default function Analytics() {
  const { transactions, loading } = useTransactions();
  const [timeframe, setTimeframe] = useState('all');

  // Filter transactions based on selected timeframe
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // Midnight of today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      
      if (timeframe === 'week') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return txDate >= sevenDaysAgo;
      }
      
      if (timeframe === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return txDate >= startOfMonth;
      }
      
      return true; // 'all'
    });
  }, [transactions, timeframe]);

  // Process data for Category Pie Chart (Expenses Only)
  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Calculate total expense to compute percentages in tooltip
  const totalExpense = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryData]);

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

  // Custom label function to render percentage outside pie slices
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.01) return null; // Don't show labels for < 1% to prevent overlap
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18; // Place label outside the pie slice
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#94a3b8" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
      >
        {`${name} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

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
            <div className="section-header" style={{ marginBottom: '1.25rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Expenses by Category</h3>
              <div className="timeframe-selector">
                <button 
                  className={`timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
                  onClick={() => setTimeframe('all')}
                >
                  All
                </button>
                <button 
                  className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeframe('month')}
                >
                  Month
                </button>
                <button 
                  className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeframe('week')}
                >
                  Week
                </button>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height="80%">
              {categoryData.length === 0 ? (
                <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>No expenses found for this timeframe.</p>
                </div>
              ) : (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={renderCustomizedLabel}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => {
                      const percentage = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : 0;
                      const formattedVal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
                      return [`${formattedVal} (${percentage}%)`, 'Amount'];
                    }}
                    contentStyle={{ backgroundColor: '#131a2a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              )}
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


