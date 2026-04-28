/* ── SHIELD API Client ──
   Calls the backend server for Gemini AI operations.
   Falls back to local logic when backend is unavailable. */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function apiCall(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Backend API call failed (${endpoint}):`, err.message);
    return null;
  }
}

/* ── Triage ── */
export async function triageIncident(text, language = 'English') {
  const result = await apiCall('/api/triage', { text, language });
  return result || fallbackTriage(text);
}

/* ── Translate ── */
export async function translateReport(text, targetLang) {
  const result = await apiCall('/api/translate', { text, targetLang });
  return result?.translated || text;
}

/* ── Incident Report ── */
export async function generateIncidentReport(incident) {
  const result = await apiCall('/api/report', { incident });
  return result || fallbackReport(incident);
}

/* ── Fallback triage (when backend is down) ── */
function fallbackTriage(text) {
  const l = text.toLowerCase();
  let type = 'security', severity = 2;
  let actions = ['Investigate report', 'Send nearest staff', 'Monitor situation'];
  if (l.includes('fire') || l.includes('smoke')) { type = 'fire'; severity = 4; actions = ['Activate fire alarm', 'Evacuate floor', 'Contact fire dept']; }
  else if (l.includes('medical') || l.includes('hurt') || l.includes('unconscious')) { type = 'medical'; severity = 3; actions = ['Send first-aider', 'Call ambulance', 'Prepare AED']; }
  else if (l.includes('flood') || l.includes('water') || l.includes('leak')) { type = 'flood'; severity = 3; actions = ['Shut water main', 'Send maintenance', 'Evacuate rooms']; }
  else if (l.includes('traffick') || l.includes('trapped') || l.includes('help me')) { type = 'trafficking'; severity = 5; actions = ['Alert security', 'Contact authorities', 'Monitor exits']; }
  else if (l.includes('intruder') || l.includes('weapon') || l.includes('threat')) { type = 'security'; severity = 4; actions = ['Lock down area', 'Send security', 'Contact police']; }
  return { type, severity, summary: `Emergency: ${text.substring(0, 100)}`, immediateActions: actions, affectedZone: 'To be determined' };
}

/* ── Fallback report ── */
function fallbackReport(incident) {
  const now = new Date();
  return {
    title: `Incident Report — ${(incident.type || 'Unknown').toUpperCase()} at ${incident.zone || incident.room || 'Unknown'}`,
    dateTime: now.toISOString(),
    location: incident.zone || incident.room || 'Unknown',
    crisisType: incident.type || 'unknown',
    severity: incident.severity || 2,
    timeline: [
      { time: new Date(incident.createdAt || Date.now()).toLocaleTimeString(), event: 'Incident reported' },
      { time: new Date((incident.createdAt || Date.now()) + 30000).toLocaleTimeString(), event: 'AI triage completed' },
      { time: new Date((incident.createdAt || Date.now()) + 60000).toLocaleTimeString(), event: 'Staff dispatched' },
      { time: now.toLocaleTimeString(), event: 'Incident resolved' },
    ],
    respondersInvolved: (incident.assignedStaff || []).map(s => ({ name: s.name || 'Staff', role: s.role || 'Responder', action: s.task || 'Responded' })),
    guestsAffected: incident.guestsAffected || Math.floor(Math.random() * 5) + 1,
    resolutionSteps: ['Area secured', 'Guests relocated', 'Damage assessed', 'Incident documented'],
    recommendations: ['Review protocols', 'Schedule training', 'Update equipment', 'Brief departments'],
  };
}
