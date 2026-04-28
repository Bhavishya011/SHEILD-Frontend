import { Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { crisisTypes } from '../lib/mockData';

export default function TaskCard({ task, onComplete, showNav = true }) {
  const crisis = crisisTypes[task.crisisType] || crisisTypes.security;

  return (
    <div className="glass-card rounded-xl p-5 border-l-4 animate-slide-up" style={{ borderLeftColor: crisis.color }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${crisis.color}20`, color: crisis.color }}>
          {crisis.label}
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold ml-auto">
          <Clock size={14} />
          <span>ETA: {task.eta}</span>
        </div>
      </div>

      <p className="text-white font-medium mb-4 leading-relaxed">{task.task}</p>

      <div className="flex gap-3">
        {showNav && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${task.lat || '19.076'},${task.lng || '72.877'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
          >
            <Navigation size={16} />
            Navigate
          </a>
        )}
        <button
          onClick={() => onComplete?.(task.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 ml-auto"
        >
          <CheckCircle2 size={16} />
          Mark Complete
        </button>
      </div>
    </div>
  );
}
