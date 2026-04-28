import { useState, useEffect } from 'react';
import {
  Shield, Map, Camera, FileText, Plus, Filter, Zap, LogOut, Clock,
  Flame, Heart, Droplets, AlertTriangle, X, ChevronRight, Activity
} from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import CrisisMap from '../components/CrisisMap';
import CCTVOverlay from '../components/CCTVOverlay';
import IncidentReport from '../components/IncidentReport';
import AlertBanner from '../components/AlertBanner';
import { listenToPath, writeIncident, writeTask, updateIncident } from '../lib/firebase';
import { dispatchStaff } from '../lib/dispatch';
import { generateIncidentReport } from '../lib/gemini';
import { crisisTypes, getRandomRoom, mockStaff } from '../lib/mockData';

export default function ManagerDashboard({ user, onLogout }) {
  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [filter, setFilter] = useState('all');
  const [showSimModal, setShowSimModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [alertIncident, setAlertIncident] = useState(null);
  const [lastAlertId, setLastAlertId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsub1 = listenToPath('incidents', (all) => {
      setIncidents(all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      const active = all.filter(i => i.status === 'active' && !i.silent);
      const latest = active[0];
      if (latest && latest.id !== lastAlertId) {
        setAlertIncident(latest);
        setLastAlertId(latest.id);
      }
    });
    const unsub2 = listenToPath('tasks', setTasks);
    return () => { unsub1?.(); unsub2?.(); };
  }, [lastAlertId]);

  const filteredIncidents = incidents.filter(i => {
    if (filter === 'active') return i.status === 'active';
    if (filter === 'resolved') return i.status === 'resolved';
    return true;
  });

  const activeCrisis = incidents.find(i => i.status === 'active');
  const activeCount = incidents.filter(i => i.status === 'active').length;

  const handleResolve = async (incident) => {
    await updateIncident(incident.id, { status: 'resolved', resolvedAt: Date.now() });
    setReportLoading(true);
    try {
      const r = await generateIncidentReport(incident);
      setReport(r);
      setActiveTab('report');
    } catch {}
    setReportLoading(false);
  };

  const tabs = [
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'cctv', label: 'CCTV View', icon: Camera },
    { id: 'report', label: 'Incident Report', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {alertIncident && <AlertBanner incident={alertIncident} onDismiss={() => setAlertIncident(null)} />}
      {showSimModal && <SimulateModal onClose={() => setShowSimModal(false)} />}

      {/* Header */}
      <header className="glass border-b border-slate-800 px-6 py-3 flex items-center justify-between z-50 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SHIELD</h1>
            <span className="text-xs text-slate-500">Command Center</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeCount > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full animate-pulse-crisis">
              <Activity size={14} className="text-red-400" />
              <span className="text-red-400 text-sm font-bold">{activeCount} Active</span>
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} border-r border-slate-800 bg-slate-950/80 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Incidents</h2>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 border border-slate-700 outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <Shield size={32} className="mx-auto mb-3 opacity-30" />
                No incidents
              </div>
            ) : (
              filteredIncidents.map((inc, i) => (
                <div key={inc.id || i} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <IncidentCard
                    incident={inc}
                    onClick={() => setSelectedIncident(inc)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-800 space-y-2 flex-shrink-0">
            <button
              onClick={() => setShowSimModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm hover:scale-[1.02] shadow-lg shadow-amber-500/20"
            >
              <Zap size={16} />
              Simulate Crisis
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800 bg-slate-950/50">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white mr-2 lg:hidden">
              <ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'map' && (
              <div className="h-full animate-fade-in">
                <CrisisMap activeCrisis={activeCrisis} incidents={incidents} />
              </div>
            )}
            {activeTab === 'cctv' && (
              <div className="animate-fade-in">
                <CCTVOverlay activeCrisis={activeCrisis} />
              </div>
            )}
            {activeTab === 'report' && (
              <div className="animate-fade-in">
                {reportLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="ml-3 text-slate-400">Generating report with AI...</span>
                  </div>
                ) : (
                  <IncidentReport report={report} />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Selected Incident Detail Panel */}
        {selectedIncident && (
          <aside className="w-80 border-l border-slate-800 bg-slate-950/80 overflow-y-auto animate-slide-up">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Incident Detail</h3>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="glass-card rounded-xl p-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Type</span>
                <p className="text-white font-semibold capitalize mt-1">{crisisTypes[selectedIncident.type]?.label || selectedIncident.type}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Location</span>
                <p className="text-white font-semibold mt-1">{selectedIncident.zone || `Room ${selectedIncident.room}`}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Severity</span>
                <span className={`severity-${selectedIncident.severity} px-3 py-1 rounded-full text-sm font-bold mt-1 inline-block`}>
                  Level {selectedIncident.severity}
                </span>
              </div>
              {selectedIncident.summary && (
                <div className="glass-card rounded-xl p-4">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">AI Summary</span>
                  <p className="text-slate-300 text-sm mt-1">{selectedIncident.summary}</p>
                </div>
              )}
              {selectedIncident.immediateActions && (
                <div className="glass-card rounded-xl p-4">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Actions</span>
                  <ul className="mt-2 space-y-1">
                    {selectedIncident.immediateActions.map((a, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedIncident.status === 'active' && (
                <button
                  onClick={() => handleResolve(selectedIncident)}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all"
                >
                  ✓ Mark Resolved & Generate Report
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ── Simulate Crisis Modal ── */
function SimulateModal({ onClose }) {
  const [type, setType] = useState('fire');
  const [room, setRoom] = useState(getRandomRoom());
  const [severity, setSeverity] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    const crisis = crisisTypes[type];
    const zone = `Floor ${Math.floor(parseInt(room) / 100)} — Room ${room}`;

    const incident = {
      type,
      severity,
      room,
      zone,
      summary: `Simulated ${crisis.label} incident at Room ${room}. Severity level ${severity}.`,
      immediateActions: crisis.defaultActions,
      affectedZone: zone,
      simulated: true,
    };

    try {
      const saved = await writeIncident(incident);
      const dispatch = dispatchStaff(type, room, zone, severity);
      for (const a of dispatch.assignments) {
        await writeTask({ ...a, incidentId: saved.id, crisisType: type, room, zone });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" /> Simulate Crisis
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Crisis Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(crisisTypes).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    type === key
                      ? 'border-white/30 text-white scale-105'
                      : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                  style={type === key ? { backgroundColor: val.color + '30', borderColor: val.color } : {}}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Room / Zone</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Severity: {severity}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 — Low</span><span>3 — High</span><span>5 — Critical</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Triggering...' : '⚡ Trigger Crisis Simulation'}
        </button>
      </div>
    </div>
  );
}
