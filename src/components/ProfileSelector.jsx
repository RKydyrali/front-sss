import './ProfileSelector.css';

const profiles = [
  { value: 'default', label: 'Default', icon: '🚶', desc: 'Balanced route' },
  { value: 'wheelchair', label: 'Wheelchair', icon: '🦽', desc: 'No stairs, smooth paths' },
  { value: 'heat_sensitive', label: 'Heat Sensitive', icon: '🌡️', desc: 'Lower heat burden' },
];

export default function ProfileSelector({ value, onChange }) {
  return (
    <div className="profile-selector">
      <label>Route Profile</label>
      <div className="profile-options">
        {profiles.map((p) => (
          <button
            key={p.value}
            className={`profile-btn ${value === p.value ? 'selected' : ''}`}
            onClick={() => onChange(p.value)}
          >
            <span className="profile-icon">{p.icon}</span>
            <span className="profile-label">{p.label}</span>
            <span className="profile-desc">{p.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
