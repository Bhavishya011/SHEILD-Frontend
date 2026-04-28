import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { mockStaff, mockGuests, HOTEL_CENTER, crisisTypes } from '../lib/mockData';

const containerStyle = { width: '100%', height: '100%', minHeight: '500px', borderRadius: '0.75rem' };

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
];

// Fallback map when Google Maps API key is not available
function FallbackMap({ activeCrisis, staff }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-900 rounded-xl relative overflow-hidden border border-slate-700">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Hotel outline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-slate-600 rounded-lg flex items-center justify-center">
        <span className="text-slate-500 text-sm font-mono">Hotel Building</span>
      </div>

      {/* Staff dots */}
      {staff.map((s, i) => {
        const angle = (i / staff.length) * Math.PI * 2 + time * 0.01;
        const radius = 80 + Math.sin(time * 0.05 + i) * 10;
        const x = 50 + Math.cos(angle) * (radius / 5);
        const y = 50 + Math.sin(angle) * (radius / 6);
        return (
          <div key={s.id} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" title={`${s.name} (${s.role})`} />
          </div>
        );
      })}

      {/* Crisis pin */}
      {activeCrisis && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-beacon w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-red-400 text-xs font-mono whitespace-nowrap">
            {activeCrisis.zone || `Room ${activeCrisis.room}`}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Staff</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Guest</span>
          {activeCrisis && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Crisis</span>}
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
        Live • {new Date().toLocaleTimeString()}
      </div>

      {/* No API key notice */}
      <div className="absolute top-4 left-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3 py-1.5 rounded-lg">
        Simulation Mode — Add VITE_GOOGLE_MAPS_KEY for live map
      </div>
    </div>
  );
}

export default function CrisisMap({ activeCrisis, incidents = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const hasKey = apiKey && apiKey !== 'your_maps_key_here';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: hasKey ? apiKey : '',
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const staff = mockStaff;

  if (!hasKey || !isLoaded) {
    return <FallbackMap activeCrisis={activeCrisis} staff={staff} />;
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={HOTEL_CENTER}
        zoom={17}
        options={{ styles: darkMapStyle, disableDefaultUI: true, zoomControl: true }}
      >
        {/* Staff markers */}
        {staff.map(s => (
          <Marker
            key={s.id}
            position={{ lat: s.lat, lng: s.lng }}
            icon={{ url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="#22c55e" stroke="white" stroke-width="2"/></svg>`), scaledSize: { width: 16, height: 16 } }}
            onClick={() => setSelectedMarker({ type: 'staff', data: s })}
          />
        ))}

        {/* Crisis marker */}
        {activeCrisis && (
          <Marker
            position={{ lat: HOTEL_CENTER.lat, lng: HOTEL_CENTER.lng }}
            icon={{ url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"><animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/></circle></svg>`), scaledSize: { width: 24, height: 24 } }}
            onClick={() => setSelectedMarker({ type: 'crisis', data: activeCrisis })}
          />
        )}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.type === 'staff' ? { lat: selectedMarker.data.lat, lng: selectedMarker.data.lng } : HOTEL_CENTER}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-sm p-1">
              {selectedMarker.type === 'staff' ? (
                <>
                  <strong>{selectedMarker.data.name}</strong><br />
                  <span className="text-gray-600">{selectedMarker.data.role} — {selectedMarker.data.zone}</span>
                </>
              ) : (
                <>
                  <strong className="text-red-600">⚠ {(crisisTypes[selectedMarker.data.type]?.label || 'Crisis')}</strong><br />
                  <span>{selectedMarker.data.zone || `Room ${selectedMarker.data.room}`}</span>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
