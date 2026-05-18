import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import { Clock, X, PlusCircle } from 'lucide-react';
import '../pages/Dashboard.css'; // For modal styles

export default function ReminderModal() {
  const { settings, loading, updateSettings } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !settings) return;

    // We only want this check to run once per session to avoid annoying the user
    const hasCheckedReminders = sessionStorage.getItem('checkedReminders');
    if (hasCheckedReminders) return;

    if (settings.reminderInterval === 'never') {
      sessionStorage.setItem('checkedReminders', 'true');
      return;
    }

    const lastDate = new Date(settings.lastTransactionDate).getTime();
    const now = Date.now();
    const diffHours = (now - lastDate) / (1000 * 60 * 60);

    let shouldRemind = false;
    
    if (settings.reminderInterval === 'daily' && diffHours >= 24) shouldRemind = true;
    if (settings.reminderInterval === '3days' && diffHours >= 72) shouldRemind = true;
    if (settings.reminderInterval === 'weekly' && diffHours >= 168) shouldRemind = true;

    if (shouldRemind) {
      setShowModal(true);
    }

    // Mark as checked for this browser session
    sessionStorage.setItem('checkedReminders', 'true');
    
  }, [settings, loading]);

  const handleGoToAdd = () => {
    setShowModal(false);
    navigate('/add');
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card form-card modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-24px' }}>
          <button onClick={handleDismiss} className="icon-btn text-muted"><X size={20}/></button>
        </div>
        
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-primary)' }}>
          <Clock size={32} />
        </div>
        
        <h2 style={{ marginBottom: '0.75rem' }}>Time to balance the books!</h2>
        <p className="text-muted" style={{ marginBottom: '2rem', lineHeight: '1.5' }}>
          It's been a while since your last transaction log. Keep your budget tracking accurate by recording your recent activity.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleGoToAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
            <PlusCircle size={20} /> Add Transaction Now
          </button>
          <button onClick={handleDismiss} className="btn-secondary" style={{ border: 'none', background: 'transparent' }}>
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
}
