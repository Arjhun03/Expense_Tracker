import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import ReminderModal from './components/ReminderModal';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {currentUser && <Navbar />}
        {currentUser && <ReminderModal />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddTransaction /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/budgets" element={<PrivateRoute><Budgets /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
