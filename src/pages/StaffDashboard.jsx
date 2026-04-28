import { useState, useEffect } from 'react';
import { Shield, ToggleLeft, ToggleRight, MapPin, Radio, LogOut } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import AlertBanner from '../components/AlertBanner';
import { listenToPath, updateTask, updateStaff } from '../lib/firebase';

export default function StaffDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [available, setAvailable] = useState(true);
  const [alertIncident, setAlertIncident] = useState(null);
  const [lastAlertId, setLastAlertId] = useState(null);

  // Listen to tasks
  useEffect(() => {
    const unsub = listenToPath('tasks', (all) => {
      const mine = all.filter(t =>
        t.staffId === user?.staffId && t.status === 'assigned'
      );
      setTasks(mine);
    });
    return unsub;
  }, [user]);

  // Listen to incidents for alerts
  useEffect(() => {
    const unsub = listenToPath('incidents', (all) => {
      setIncidents(all);
      const active = all.filter(i => i.status === 'active' && !i.silent);
      const latest = active.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
      if (latest && latest.id !== lastAlertId) {
        setAlertIncident(latest);
        setLastAlertId(latest.id);
      }
    });
    return unsub;
  }, [lastAlertId]);

  const toggleAvailability = () => {
    const newStatus = !available;
    setAvailable(newStatus);
    if (user?.staffId) {
      updateStaff(user.staffId, { status: newStatus ? 'available' : 'busy' });
    }
  };

  const handleComplete = (taskId) => {
    updateTask(taskId, { status: 'completed', completedAt: Date.now() });
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (user?.staffId) {
      updateStaff(user.staffId, { status: 'available' });
    }
  };

  const activeTask = tasks[0];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Alert Banner */}
      {alertIncident && (
        <AlertBanner incident={alertIncident} onDismiss={() => setAlertIncident(null)} />
      )}

      <div className="max-w-[420px] mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{user?.name || 'Staff Member'}</h1>
              <span className="text-xs text-slate-400 capitalize">{user?.role || 'staff'}</span>
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass transition-all duration-200"
          >
            {available ? (
              <ToggleRight size={24} className="text-green-400" />
            ) : (
              <ToggleLeft size={24} className="text-slate-500" />
            )}
            <span className={`text-xs font-semibold ${available ? 'text-green-400' : 'text-slate-500'}`}>
              {available ? 'Available' : 'Busy'}
            </span>
          </button>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="w-9 h-9 flex items-center justify-center rounded-xl glass text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`glass-card rounded-xl p-3 mb-4 flex items-center gap-2 animate-fade-in ${
          activeTask ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
        }`}>
          <Radio size={14} className={activeTask ? 'text-red-400 animate-pulse' : 'text-green-400'} />
          <span className="text-sm text-slate-300">
            {activeTask ? 'Active Assignment — Respond Immediately' : 'Standby — No active assignments'}
          </span>
        </div>

        {/* Active Task */}
        {activeTask ? (
          <div className="mb-6 animate-slide-up">
            <TaskCard task={activeTask} onComplete={handleComplete} />
          </div>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center mb-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-green-400 animate-float" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">All Clear</h2>
            <p className="text-sm text-slate-400">No active assignments. Stay vigilant.</p>
          </div>
        )}

        {/* Mini Map */}
        <div className="glass-card rounded-xl p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <MapPin size={14} /> Your Position
          </h3>
          <div className="relative bg-slate-900 rounded-lg h-48 overflow-hidden border border-slate-700/50">
            {/* Simple position visualization */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="miniGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#miniGrid)" />
            </svg>

            {/* Hotel outline */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-24 border border-slate-700 rounded opacity-50" />

            {/* Your position */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-glow-pulse" />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-mono whitespace-nowrap">You</span>
            </div>

            {/* Crisis pin if active */}
            {activeTask && (
              <div className="absolute top-1/4 left-3/4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-beacon" />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-red-400 font-mono whitespace-nowrap">Crisis</span>
              </div>
            )}

            <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
              Live Tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
