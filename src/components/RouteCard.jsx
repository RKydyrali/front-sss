import './RouteCard.css';

const typeColors = {
  fastest: '#3b82f6',
  comfortable: '#22c55e',
  accessible: '#a855f7',
};

const typeLabels = {
  fastest: 'Fastest',
  comfortable: 'Comfortable',
  accessible: 'Accessible',
};

export default function RouteCard({ route, isSelected, onClick }) {
  const color = typeColors[route.type] || '#666';
  const label = typeLabels[route.type] || route.type;

  return (
    <div 
      className={`route-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: color }}
    >
      <div className="route-header">
        <span className="route-type" style={{ background: color }}>{label}</span>
        <span className="route-score">{route.score?.toFixed(2)}</span>
      </div>
      
      <div className="route-stats">
        <div className="stat">
          <span className="stat-value">{route.distance_m?.toFixed(0)}m</span>
          <span className="stat-label">Distance</span>
        </div>
        <div className="stat">
          <span className="stat-value">{route.eta_min}min</span>
          <span className="stat-label">Time</span>
        </div>
        <div className="stat">
          <span className="stat-value">{route.metrics?.stairs_segments || 0}</span>
          <span className="stat-label">Stairs</span>
        </div>
      </div>

      <div className="route-explanations">
        {route.explanations?.slice(0, 2).map((exp, i) => (
          <span key={i} className="explanation">{exp}</span>
        ))}
      </div>
    </div>
  );
}
