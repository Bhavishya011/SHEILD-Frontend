import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { crisisTypes } from '../lib/mockData';

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (time) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.3);
    };
    playBeep(ctx.currentTime);
    playBeep(ctx.currentTime + 0.4);
    playBeep(ctx.currentTime + 0.8);
  } catch {}
}

export default function AlertBanner({ incident, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (incident) {
      playAlertSound();
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [incident]);

  if (!incident || !visible) return null;

  const crisis = crisisTypes[incident.type] || crisisTypes.security;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" style={{ backgroundColor: 'rgba(220, 38, 38, 0.95)' }}>
      <button onClick={() => { setVisible(false); onDismiss?.(); }} className="absolute top-6 right-6 text-white/80 hover:text-white">
        <X size={32} />
      </button>
      <div className="text-center text-white px-8 max-w-lg">
        <div className="animate-pulse-crisis mb-6">
          <AlertTriangle size={80} className="mx-auto" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-wider mb-4">
          {crisis.label} Alert
        </h1>
        <p className="text-2xl font-semibold mb-2">
          {incident.zone || `Room ${incident.room}`}
        </p>
        <p className="text-lg opacity-90 mb-6">
          Severity: {incident.severity}/5
        </p>
        <p className="text-base opacity-75">
          {incident.summary || 'Emergency response initiated. All staff check assignments.'}
        </p>
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <span key={i} className="w-3 h-3 rounded-full bg-white animate-pulse-crisis" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
