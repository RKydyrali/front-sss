import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routeApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import RouteCard from '../components/RouteCard';
import ProfileSelector from '../components/ProfileSelector';
import './MapPage.css';

const userLocationIcon = new L.DivIcon({
  className: 'user-marker',
  html: '<div class="pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const markerIconA = new L.DivIcon({
  className: 'marker-a',
  html: '<div class="marker-inner">A</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const markerIconB = new L.DivIcon({
  className: 'marker-b',
  html: '<div class="marker-inner">B</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationButton({ onClick }) {
  return (
    <button className="location-btn" onClick={onClick} title="My Location">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    </button>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

function RecentRoutesSidebar({ routes, onSelect, isOpen, onClose }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Recent Routes</h3>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
      <div className="sidebar-content">
        {routes.length === 0 ? (
          <p className="no-routes">No recent routes</p>
        ) : (
          routes.map((route, index) => (
            <div key={route.id} className="recent-route" onClick={() => onSelect(route)}>
              <div className="route-info">
                <span className="route-index">{index + 1}</span>
                <div>
                  <p className="route-profile">{route.profile}</p>
                  <p className="route-coords">
                    {route.origin_lat.toFixed(4)}, {route.origin_lon.toFixed(4)}
                    <br />
                    {route.destination_lat.toFixed(4)}, {route.destination_lon.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [profile, setProfile] = useState('default');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataQuality, setDataQuality] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  const defaultCenter = [43.2389, 76.8897];

  useEffect(() => {
    if (user) {
      routeApi.getRecent()
        .then((res) => setRecentRoutes(res.data.items || []))
        .catch(() => {});
    }
  }, [user]);

  const handleMapClick = (latlng) => {
    if (!origin) {
      setOrigin({ lat: latlng.lat, lon: latlng.lng });
    } else if (!destination) {
      setDestination({ lat: latlng.lat, lon: latlng.lng });
    } else {
      setOrigin({ lat: latlng.lat, lon: latlng.lng });
      setDestination(null);
      setRoutes([]);
      setSelectedRoute(null);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleBuildRoute = async (
    routeOrigin = origin,
    routeDestination = destination,
    routeProfile = profile
  ) => {
    if (!routeOrigin || !routeDestination) return;

    setLoading(true);
    try {
      const departureTime = new Date().toISOString();
      const res = await routeApi.build({
        origin: routeOrigin,
        destination: routeDestination,
        profile: routeProfile,
        departure_time: departureTime,
      });

      setRoutes(res.data.routes || []);
      setDataQuality(res.data.data_quality);
      setMessages(res.data.messages || []);

      if (res.data.routes?.length > 0) {
        setSelectedRoute(res.data.routes[0]);
      }

      if (user) {
        routeApi.getRecent()
          .then((recentRes) => setRecentRoutes(recentRes.data.items || []))
          .catch(() => {});
      }
    } catch (err) {
      console.error('Route build error:', err);
      setMessages([err.response?.data?.detail || 'Failed to build route']);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecentRoute = (route) => {
    const nextOrigin = { lat: route.origin_lat, lon: route.origin_lon };
    const nextDestination = { lat: route.destination_lat, lon: route.destination_lon };
    const nextProfile = route.profile || 'default';

    setOrigin(nextOrigin);
    setDestination(nextDestination);
    setProfile(nextProfile);
    setSidebarOpen(false);
    handleBuildRoute(nextOrigin, nextDestination, nextProfile);
  };

  const getRouteCoordinates = () => {
    if (!selectedRoute?.coordinates) return [];
    return selectedRoute.coordinates.map((coordinate) => [coordinate.latitude, coordinate.longitude]);
  };

  return (
    <div className="map-page">
      <div className="top-bar">
        <h1>Jolserik</h1>
        {user && (
          <div className="user-info">
            <span>{user.full_name}</span>
            <a href="/profile">Profile</a>
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="map"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {origin && (
            <Marker position={[origin.lat, origin.lon]} icon={markerIconA} />
          )}
          {destination && (
            <Marker position={[destination.lat, destination.lon]} icon={markerIconB} />
          )}
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon} />
          )}
          {selectedRoute && getRouteCoordinates().length > 0 && (
            <Polyline
              positions={getRouteCoordinates()}
              color={selectedRoute.type === 'fastest' ? '#3b82f6' : selectedRoute.type === 'comfortable' ? '#22c55e' : '#a855f7'}
              weight={5}
            />
          )}
        </MapContainer>

        <LocationButton onClick={handleGetLocation} />

        <button
          className="history-btn"
          onClick={() => setSidebarOpen(true)}
          title="Route History"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
          </svg>
        </button>

        <RecentRoutesSidebar
          routes={recentRoutes}
          onSelect={handleSelectRecentRoute}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="control-panel">
          <div className="points-info">
            <div className={`point ${origin ? 'set' : ''}`}>
              <span className="point-label">A</span>
              <span>{origin ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}` : 'Tap map to set origin'}</span>
            </div>
            <div className={`point ${destination ? 'set' : ''}`}>
              <span className="point-label">B</span>
              <span>{destination ? `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}` : 'Tap map to set destination'}</span>
            </div>
          </div>

          <ProfileSelector value={profile} onChange={setProfile} />

          <button
            className="build-route-btn"
            onClick={() => handleBuildRoute()}
            disabled={!origin || !destination || loading}
          >
            {loading ? 'Building Route...' : 'Build Route'}
          </button>

          {messages.length > 0 && (
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className="message">{msg}</div>
              ))}
            </div>
          )}

          {routes.length > 0 && (
            <div className="routes-panel">
              <div className="routes-list">
                {routes.map((route, index) => (
                  <RouteCard
                    key={index}
                    route={route}
                    isSelected={selectedRoute === route}
                    onClick={() => setSelectedRoute(route)}
                  />
                ))}
              </div>
              {dataQuality && (
                <div className="data-quality">
                  <small>
                    Surface: {dataQuality.surface_available ? 'Yes' : 'No'} | Weather: {dataQuality.weather_available ? 'Yes' : 'No'} | Air: {dataQuality.air_available ? 'Yes' : 'No'}
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
