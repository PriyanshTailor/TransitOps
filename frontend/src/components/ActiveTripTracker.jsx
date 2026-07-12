import { useState, useEffect } from 'react';
import Card from './ui/Card';

const ActiveTripTracker = ({ trip }) => {
  const [weatherOrigin, setWeatherOrigin] = useState(null);
  const [weatherDest, setWeatherDest] = useState(null);

  useEffect(() => {
    if (!trip) return;

    const fetchWeather = async (city, setter) => {
      try {
        const coords = {
          'Chicago': { lat: 41.87, lon: -87.62 },
          'Detroit': { lat: 42.33, lon: -83.04 },
          'Mumbai': { lat: 19.07, lon: 72.87 },
          'Delhi': { lat: 28.61, lon: 77.20 },
          'City A': { lat: 34.05, lon: -118.24 },
          'City B': { lat: 36.16, lon: -115.13 },
        };
        const { lat, lon } = coords[city] || coords['Chicago'];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        setter(data.current_weather);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather(trip.origin, setWeatherOrigin);
    fetchWeather(trip.destination, setWeatherDest);
  }, [trip]);

  if (!trip) return null;

  return (
    <Card title="Live Trip Telemetry" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(59,130,246,0.1) 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
        
        {/* Dynamic Map SVG */}
        <div style={{ position: 'relative', height: '140px', background: 'var(--surface-hover)', borderRadius: '12px', overflow: 'hidden', padding: '2rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.5 }}>
                <path d="M 0 50 Q 100 20 200 50 T 400 50" fill="transparent" stroke="var(--primary)" strokeWidth="3" strokeDasharray="8,8" />
            </svg>
            
            <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', border: '4px solid var(--surface)', zIndex: 2 }}></div>
                <span style={{ fontWeight: 'bold', marginTop: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>{trip.origin}</span>
            </div>
            
            {/* The Truck */}
            <div style={{ position: 'absolute', top: '35%', left: trip.status === 'In Transit' ? '50%' : trip.status === 'Completed' ? '85%' : '15%', transform: 'translate(-50%, -50%)', transition: 'left 1s ease-in-out', zIndex: 10 }}>
                <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>🚛</div>
            </div>

            <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success)', border: '4px solid var(--surface)', zIndex: 2 }}></div>
                <span style={{ fontWeight: 'bold', marginTop: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>{trip.destination}</span>
            </div>
        </div>

        {/* Weather API Modules */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ fontSize: '2.5rem' }}>🌤️</div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origin Weather</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{weatherOrigin ? `${weatherOrigin.temperature}°C` : '...'}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{trip.origin}</div>
             </div>
          </div>
          
          <div style={{ flex: '1 1 200px', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ fontSize: '2.5rem' }}>🌦️</div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination Weather</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{weatherDest ? `${weatherDest.temperature}°C` : '...'}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{trip.destination}</div>
             </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default ActiveTripTracker;
