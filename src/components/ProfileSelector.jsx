import './ProfileSelector.css';

const profiles = [
  {
    value: 'default',
    label: 'Default',
    icon: 'Route',
    desc: 'Balanced trip with a stable mix of speed and comfort.',
    badge: 'Balanced',
    accent: '#3b82f6',
  },
  {
    value: 'wheelchair',
    label: 'Wheelchair',
    icon: 'Access',
    desc: 'Avoids stairs and favors smoother, easier-to-navigate paths.',
    badge: 'Accessible',
    accent: '#a855f7',
  },
  {
    value: 'heat_sensitive',
    label: 'Heat Sensitive',
    icon: 'Shade',
    desc: 'Prefers lower heat exposure for more comfortable movement.',
    badge: 'Comfort',
    accent: '#22c55e',
  },
];

export default function ProfileSelector({ value, onChange }) {
  return (
    <div className="profile-selector">
      <div className="profile-selector-header">
        <label>Route Profile</label>
        <span className="profile-selector-caption">List of options</span>
      </div>

      <div className="profile-options">
        {profiles.map((profile) => (
          <button
            key={profile.value}
            type="button"
            className={`profile-option-card ${value === profile.value ? 'selected' : ''}`}
            onClick={() => onChange(profile.value)}
            style={{ borderLeftColor: profile.accent }}
          >
            <div className="profile-option-header">
              <span
                className="profile-option-badge"
                style={{ backgroundColor: profile.accent }}
              >
                {profile.badge}
              </span>
              <span className="profile-option-icon">{profile.icon}</span>
            </div>
            <span className="profile-option-label">{profile.label}</span>
            <span className="profile-option-desc">{profile.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
