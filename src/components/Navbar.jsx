import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History as HistoryIcon, 
  PieChart, 
  LogOut,
  Wallet
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="sidebar glass-card">
      <div className="sidebar-brand">
        <Wallet className="brand-icon" size={32} />
        <h2>FinTrack</h2>
      </div>

      <div className="user-profile">
        <div className="avatar">
          {currentUser?.email?.charAt(0).toUpperCase()}
        </div>
        <span className="user-email">{currentUser?.email}</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <PlusCircle size={20} />
          <span>Add Transaction</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <HistoryIcon size={20} />
          <span>History</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <PieChart size={20} />
          <span>Analytics</span>
        </NavLink>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </nav>
  );
}
