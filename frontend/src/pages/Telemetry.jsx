import { useState, useEffect } from 'react';
import { fetchTrips } from '../services/api';
import ActiveTripTracker from '../components/ActiveTripTracker';

const Telemetry = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTrips();
        setTrips(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load telemetry data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // Refresh telemetry every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeTrips = trips.filter(t => t.status === 'In Transit' || t.status === 'Dispatched');

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Live Trip Telemetry</h2>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {loading ? (
        <div style={{padding: '2rem', textAlign: 'center'}}>Initializing Telemetry Systems...</div>
      ) : activeTrips.length === 0 ? (
        <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>No active trips to track at the moment.</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          {activeTrips.map(trip => (
            <div key={trip.id}>
              <div style={{marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem'}}>{trip.trip_number} - {trip.vehicle_reg}</div>
              <ActiveTripTracker trip={trip} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Telemetry;
