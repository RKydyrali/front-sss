import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';
import './Profile.css';

export default function Profile() {
  const { user, logout, logoutAll, login } = useAuth();
  const [preferences, setPreferences] = useState({
    default_profile: 'default',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    window.location.href = '/login';
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await userApi.updatePreferences(preferences);
      setMessage('Preferences saved!');
    } catch (err) {
      setMessage('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p>Please login to view your profile</p>
        <a href="/login">Login</a>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Profile</h1>
        
        <div className="user-details">
          <div className="avatar">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="info">
            <h2>{user.full_name}</h2>
            <p>{user.email}</p>
            <span className="role-badge">{user.role}</span>
          </div>
        </div>

        <div className="preferences-section">
          <h3>Default Route Profile</h3>
          <select
            value={preferences.default_profile}
            onChange={(e) => setPreferences({ ...preferences, default_profile: e.target.value })}
          >
            <option value="default">Default</option>
            <option value="wheelchair">Wheelchair</option>
            <option value="heat_sensitive">Heat Sensitive</option>
          </select>
          <button onClick={handleSavePreferences} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
          {message && <p className="message">{message}</p>}
        </div>

        <div className="actions">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="logout-all-btn" onClick={handleLogoutAll}>
            Logout All Devices
          </button>
        </div>

        <a href="/map" className="back-link">← Back to Map</a>
      </div>
    </div>
  );
}
