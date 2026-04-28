import { Flame, Heart, Shield, Droplets, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { crisisTypes } from '../lib/mockData';

const iconMap = { Flame, Heart, Shield, Droplets, AlertTriangle };

export default function IncidentCard({ incident, onClick, compact = false }) {
  const crisis = crisisTypes[incident.type] || crisisTypes.security;
  const Icon = iconMap[crisis.icon] || AlertTriangle;
  const elapsed = incident.createdAt ? Math.floor((Date.now() - incident.createdAt) / 60000) : 0;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/20 ${
        incident.status === 'active' ? 'border-l-4' : 'opacity-60'
      } ${compact ? 'p-3' : 'p-4'}`}
      style={{ borderLeftColor: incident.status === 'active' ? crisis.color : 'transparent' }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-lg p-2 flex-shrink-0 ${incident.status === 'active' ? 'animate-pulse-crisis' : ''}`}
          style={{ backgroundColor: `${crisis.color}20`, color: crisis.color }}
        >
          <Icon size={compact ? 18 : 22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm truncate">
              {crisis.label}
            </span>
            <span className={`severity-${incident.severity} text-xs font-bold px-2 py-0.5 rounded-full`}>
              S{incident.severity}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin size={12} />
            <span className="truncate">{incident.zone || `Room ${incident.room}`}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Clock size={12} />
              <span>{elapsed}m ago</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                incident.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {incident.status === 'active' ? 'Active' : 'Resolved'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
