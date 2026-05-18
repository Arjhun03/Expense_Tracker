import React, { useState } from 'react';
import useSettings from '../hooks/useSettings';
import { Bell, Clock, Save, ShieldCheck } from 'lucide-react';
import './Dashboard.css';

export default function Settings() {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  
  // Local state for forms
  const [interval, setIntervalState] = useState(settings?.reminderInterval || 'never');

  // Sync local state when settings loads
  React.useEffect(() => {
    if (settings) {
      setIntervalState(settings.reminderInterval);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ reminderInterval: interval });
      // Small native alert just for confirmation
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings", err);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        await updateSettings({ notificationsEnabled: true });
        new Notification("Notifications Enabled!", {
          body: "You will now receive alerts when you exceed a budget.",
        });
      } else {
        await updateSettings({ notificationsEnabled: false });
        alert("Notification permissions denied.");
      }
    });
  };

  if (loading) return <div className="page-loader">Loading settings...</div>;

  const permissionGranted = Notification.permission === "granted" && settings?.notificationsEnabled;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Settings & Preferences</h1>
        <p className="text-muted">Configure your notifications and app behavior</p>
      </header>

      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        
        {/* Notifications & Reminders Panel */}
        <div className="glass-card form-card" style={{ width: '100%', maxWidth: 'none' }}>
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={24} className="text-accent" />
              Smart Alerts & Reminders
            </h2>
          </div>

          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Desktop Push Notifications
              {permissionGranted && <ShieldCheck size={18} className="text-income" />}
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              Receive instant native alerts on your operating system when you add an expense that pushes you over your set budget limit.
            </p>
            
            {!permissionGranted ? (
              <button onClick={requestNotificationPermission} className="btn-primary" style={{ fontSize: '0.9rem' }}>
                Enable Push Notifications
              </button>
            ) : (
              <div style={{ color: 'var(--income-color)', fontWeight: 600, fontSize: '0.9rem' }}>
                ✓ Push notifications are active
              </div>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                <Clock size={18} /> Inactivity Reminder Schedule
              </label>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                If you haven't logged any transactions, FinTrack will prompt you to balance your books when you launch the app.
              </p>
              
              <div className="radio-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <label className={`radio-option ${interval === 'daily' ? 'selected income' : ''}`} style={{ flex: '1 1 200px' }}>
                  <input type="radio" value="daily" checked={interval === 'daily'} onChange={e => setIntervalState(e.target.value)} />
                  Every Day
                </label>
                <label className={`radio-option ${interval === '3days' ? 'selected income' : ''}`} style={{ flex: '1 1 200px' }}>
                  <input type="radio" value="3days" checked={interval === '3days'} onChange={e => setIntervalState(e.target.value)} />
                  Every 3 Days
                </label>
                <label className={`radio-option ${interval === 'weekly' ? 'selected income' : ''}`} style={{ flex: '1 1 200px' }}>
                  <input type="radio" value="weekly" checked={interval === 'weekly'} onChange={e => setIntervalState(e.target.value)} />
                  Every Week
                </label>
                <label className={`radio-option ${interval === 'never' ? 'selected expense' : ''}`} style={{ flex: '1 1 200px' }}>
                  <input type="radio" value="never" checked={interval === 'never'} onChange={e => setIntervalState(e.target.value)} />
                  Never Remind Me
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
