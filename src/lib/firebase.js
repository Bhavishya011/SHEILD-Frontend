import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, update, remove, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shield-crisis-app'}.firebaseapp.com`,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shield-crisis-app'}-default-rtdb.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shield-crisis-app',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shield-crisis-app'}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000:web:000000000',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

/* ── In-memory store for demo mode ── */
const localStore = { incidents: {}, tasks: {}, staff: {} };
const localListeners = {};
let isDemoMode = false;

function notifyListeners(path) {
  if (localListeners[path]) {
    const data = localStore[path];
    localListeners[path].forEach(cb => cb(data ? Object.values(data) : []));
  }
}

/* Race a Firebase promise against a timeout — if Firebase hangs, return fallback */
function withTimeout(promise, fallback, ms = 3000) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => {
      isDemoMode = true;
      resolve(fallback);
    }, ms)),
  ]);
}

/* ── Hardcoded user roles (fallback when Firebase Auth is not set up) ── */
const USER_ROLES = {
  'manager@shield.com': { role: 'manager', name: 'Alex Rivera', staffId: 'm1' },
  'staff1@shield.com': { role: 'staff', name: 'Jordan Blake', staffId: 's2' },
  'staff2@shield.com': { role: 'staff', name: 'Casey Morgan', staffId: 's4' },
};

/* ── Auth helpers ── */
export async function loginUser(email, password) {
  try {
    const result = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      null,
      3000
    );
    if (result) {
      const roleInfo = USER_ROLES[email] || { role: 'staff', name: email.split('@')[0] };
      return { uid: result.user.uid, email, ...roleInfo };
    }
    throw new Error('timeout');
  } catch (err) {
    // Fallback: demo login
    if (USER_ROLES[email] && password === 'shield123') {
      isDemoMode = true;
      return { uid: `demo-${Date.now()}`, email, ...USER_ROLES[email] };
    }
    throw new Error('Invalid credentials. Use manager@shield.com or staff1@shield.com with password: shield123');
  }
}

export async function logoutUser() {
  try { await signOut(auth); } catch {}
}

/* ── Database helpers with demo mode fallback ── */
export async function writeIncident(incident) {
  const id = `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const data = { ...incident, id, createdAt: Date.now(), status: 'active' };

  // Always store locally so demo mode works
  localStore.incidents[id] = data;
  notifyListeners('incidents');

  if (!isDemoMode) {
    try {
      const incRef = push(ref(db, 'incidents'));
      data.id = incRef.key || id;
      await withTimeout(set(incRef, data), data);
    } catch {
      console.warn('Firebase write failed — demo mode');
    }
  }
  return data;
}

export async function writeTask(task) {
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const data = { ...task, id, createdAt: Date.now(), status: 'assigned' };

  localStore.tasks[id] = data;
  notifyListeners('tasks');

  if (!isDemoMode) {
    try {
      const taskRef = push(ref(db, 'tasks'));
      data.id = taskRef.key || id;
      await withTimeout(set(taskRef, data), data);
    } catch {
      console.warn('Firebase write failed — demo mode');
    }
  }
  return data;
}

export async function updateIncident(incidentId, updates) {
  // Update local store
  if (localStore.incidents[incidentId]) {
    Object.assign(localStore.incidents[incidentId], updates);
    notifyListeners('incidents');
  }
  if (!isDemoMode) {
    try { await withTimeout(update(ref(db, `incidents/${incidentId}`), updates), null); } catch {}
  }
}

export async function updateTask(taskId, updates) {
  if (localStore.tasks[taskId]) {
    Object.assign(localStore.tasks[taskId], updates);
    notifyListeners('tasks');
  }
  if (!isDemoMode) {
    try { await withTimeout(update(ref(db, `tasks/${taskId}`), updates), null); } catch {}
  }
}

export async function updateStaff(staffId, updates) {
  if (!isDemoMode) {
    try { await withTimeout(update(ref(db, `staff/${staffId}`), updates), null); } catch {}
  }
}

export function listenToPath(path, callback) {
  // Register local listener
  if (!localListeners[path]) localListeners[path] = [];
  localListeners[path].push(callback);

  // Immediately emit local data if we have any
  const localData = localStore[path];
  if (localData && Object.keys(localData).length > 0) {
    callback(Object.values(localData));
  }

  // Also try Firebase listener
  let fbUnsub;
  try {
    fbUnsub = onValue(ref(db, path), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Merge Firebase data with local data
        const merged = { ...(localStore[path] || {}), ...data };
        localStore[path] = merged;
      }
      callback(localStore[path] ? Object.values(localStore[path]) : []);
    }, (error) => {
      isDemoMode = true;
      console.warn(`Firebase listener failed for ${path} — demo mode`);
      callback(localStore[path] ? Object.values(localStore[path]) : []);
    });
  } catch {
    isDemoMode = true;
  }

  // Return unsub
  return () => {
    localListeners[path] = (localListeners[path] || []).filter(cb => cb !== callback);
    if (fbUnsub) fbUnsub();
  };
}

export function seedStaffToFirebase(staffList) {
  staffList.forEach(s => {
    set(ref(db, `staff/${s.id}`), s).catch(() => {});
  });
}

export { ref, set, push, onValue, update, remove, get };
