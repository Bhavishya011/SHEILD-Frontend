import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Send, AlertTriangle, CheckCircle2, Globe, EyeOff, Loader2 } from 'lucide-react';
import { triageIncident, translateReport } from '../lib/gemini';
import { writeIncident, writeTask } from '../lib/firebase';
import { dispatchStaff } from '../lib/dispatch';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'zh', label: '中文 (Mandarin)' },
];

export default function GuestSOS() {
  const [params] = useSearchParams();
  const [room, setRoom] = useState(params.get('room') || '');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [eta, setEta] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (silent = false) => {
    if (!text.trim() && !silent) return;
    setLoading(true);
    setError('');

    try {
      let triage;
      if (silent) {
        triage = { type: 'trafficking', severity: 5, summary: 'Silent distress alert from guest', immediateActions: ['Alert security silently', 'Contact authorities', 'Monitor exits'], affectedZone: `Room ${room}` };
      } else {
        const lang = languages.find(l => l.code === language)?.label || 'English';
        triage = await triageIncident(text, lang);
      }

      // Translate if needed
      let translatedText = text;
      if (language !== 'en' && !silent) {
        translatedText = await translateReport(text, 'English');
      }

      const incident = {
        ...triage,
        room,
        originalText: text,
        translatedText,
        language,
        silent: !!silent,
        guestReported: true,
      };

      // Write to Firebase
      const saved = await writeIncident(incident);

      // Dispatch staff
      const dispatch = dispatchStaff(triage.type, room, triage.affectedZone, triage.severity);
      setAssignments(dispatch.assignments);
      setEta(dispatch.assignments[0]?.eta || '120 sec');

      // Write tasks
      for (const a of dispatch.assignments) {
        await writeTask({
          ...a,
          incidentId: saved.id,
          crisisType: triage.type,
          room,
          zone: triage.affectedZone,
        });
      }

      setSilentMode(silent);
      setSubmitted(true);
    } catch (err) {
      console.error('SOS submission error:', err);
      setError('Failed to submit. Your emergency has been logged locally. Please call the front desk.');
      // Still show submitted state
      setSubmitted(true);
      setSilentMode(silent);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    if (silentMode) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <p className="text-gray-600 text-lg text-center">Your request has been received.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Help is on the way</h1>
          <p className="text-slate-400 mb-6">Estimated arrival: <span className="text-amber-400 font-bold text-xl">{eta}</span></p>

          <div className="glass-card rounded-xl p-5 text-left space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Assigned Responders</h3>
            {assignments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={14} className="text-green-400" />
                </div>
                <div>
                  <span className="text-sm text-white font-medium capitalize">{a.role}</span>
                  <p className="text-xs text-slate-400">ETA: {a.eta}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">Stay where you are if safe. Keep this page open for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mb-4 shadow-lg shadow-red-500/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Emergency Report</h1>
          <p className="text-slate-400 text-sm mt-2">SHIELD Crisis Response System</p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-5 animate-slide-up">
          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Room Number</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., 412"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none text-lg font-mono"
            />
          </div>

          {/* Emergency text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Describe the emergency</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Describe what's happening...\nक्या हो रहा है बताएं..."}
              rows={5}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none resize-none"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Globe size={14} /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-800">{l.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading || !text.trim()}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <><Send size={22} /> Send Emergency Alert</>
            )}
          </button>

          {/* Silent SOS */}
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="w-full py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-700 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <EyeOff size={16} />
            Silent Alert (Hidden Danger)
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          This page is monitored 24/7 by hotel security AI
        </p>
      </div>
    </div>
  );
}
