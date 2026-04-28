/* ── Mock Data for SHIELD Crisis Response ── */

// Hotel coordinates (example: Mumbai hotel)
export const HOTEL_CENTER = { lat: 19.076, lng: 72.8777 };

// ── Staff Members ──
export const mockStaff = [
  { id: 's1', name: 'Raj Patel', role: 'security', floor: 0, zone: 'Lobby', status: 'available', lat: 19.0761, lng: 72.8775 },
  { id: 's2', name: 'Jordan Blake', role: 'security', floor: 2, zone: 'Floor 2 Corridor', status: 'available', lat: 19.0762, lng: 72.8778 },
  { id: 's3', name: 'Priya Sharma', role: 'security', floor: 4, zone: 'Floor 4 East', status: 'available', lat: 19.0763, lng: 72.8779 },
  { id: 's4', name: 'Casey Morgan', role: 'first-aider', floor: 0, zone: 'Reception', status: 'available', lat: 19.0760, lng: 72.8776 },
  { id: 's5', name: 'Ananya Desai', role: 'first-aider', floor: 1, zone: 'Restaurant', status: 'available', lat: 19.0759, lng: 72.8774 },
  { id: 's6', name: 'Marcus Chen', role: 'first-aider', floor: 3, zone: 'Gym', status: 'available', lat: 19.0764, lng: 72.8780 },
  { id: 's7', name: 'Alex Rivera', role: 'manager', floor: 1, zone: 'Admin Office', status: 'available', lat: 19.0761, lng: 72.8777 },
  { id: 's8', name: 'Samira Khan', role: 'manager', floor: 3, zone: 'Floor 3 Office', status: 'available', lat: 19.0763, lng: 72.8777 },
  { id: 's9', name: 'Deepak Nair', role: 'maintenance', floor: -1, zone: 'Basement', status: 'available', lat: 19.0758, lng: 72.8775 },
  { id: 's10', name: 'Tom Wilson', role: 'maintenance', floor: 1, zone: 'Floor 1 Utility', status: 'available', lat: 19.0760, lng: 72.8778 },
];

// ── Guests (40 checked-in) ──
const firstNames = ['Emma','Liam','Sophia','Noah','Ava','Oliver','Mia','James','Isabella','William','Charlotte','Ben','Amelia','Lucas','Harper','Henry','Evelyn','Jack','Aria','Daniel','Ella','Michael','Luna','Owen','Chloe','Ethan','Grace','Aiden','Zoe','Jacob'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee'];

export const mockGuests = Array.from({ length: 40 }, (_, i) => {
  const floor = Math.floor(i / 10) + 1;
  const room = floor * 100 + (i % 10) + 1;
  return {
    id: `g${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    room: `${room}`,
    floor,
    lat: HOTEL_CENTER.lat + (Math.random() - 0.5) * 0.002,
    lng: HOTEL_CENTER.lng + (Math.random() - 0.5) * 0.002,
  };
});

// ── CCTV Persons (simulated detections) ──
export const cctvPersons = [
  { id: 'p1', type: 'staff', x: 80, y: 120, cameraZone: 'Lobby', color: '#22c55e' },
  { id: 'p2', type: 'staff', x: 200, y: 90, cameraZone: 'Lobby', color: '#22c55e' },
  { id: 'p3', type: 'guest', x: 150, y: 180, cameraZone: 'Lobby', color: '#3b82f6' },
  { id: 'p4', type: 'guest', x: 60, y: 60, cameraZone: 'Lobby', color: '#3b82f6' },
  { id: 'p5', type: 'staff', x: 100, y: 100, cameraZone: 'Floor 2 Corridor', color: '#22c55e' },
  { id: 'p6', type: 'guest', x: 220, y: 150, cameraZone: 'Floor 2 Corridor', color: '#3b82f6' },
  { id: 'p7', type: 'guest', x: 180, y: 80, cameraZone: 'Restaurant', color: '#3b82f6' },
  { id: 'p8', type: 'guest', x: 50, y: 190, cameraZone: 'Restaurant', color: '#3b82f6' },
  { id: 'p9', type: 'staff', x: 130, y: 130, cameraZone: 'Restaurant', color: '#22c55e' },
  { id: 'p10', type: 'guest', x: 250, y: 100, cameraZone: 'Parking Entrance', color: '#3b82f6' },
  { id: 'p11', type: 'staff', x: 40, y: 170, cameraZone: 'Parking Entrance', color: '#22c55e' },
];

// Unknown persons (appear during crisis)
export const unknownPersons = [
  { id: 'u1', type: 'unknown', x: 260, y: 200, cameraZone: 'Lobby', color: '#ef4444' },
  { id: 'u2', type: 'unknown', x: 40, y: 210, cameraZone: 'Lobby', color: '#ef4444' },
];

// ── Crisis Type Definitions ──
export const crisisTypes = {
  fire: { label: 'Fire', severity: 4, color: '#ef4444', icon: 'Flame', defaultActions: ['Activate fire alarm', 'Evacuate affected floors', 'Contact fire department', 'Deploy fire extinguishers'] },
  medical: { label: 'Medical', severity: 3, color: '#f59e0b', icon: 'Heart', defaultActions: ['Send first-aider', 'Call ambulance', 'Prepare AED', 'Clear area for paramedics'] },
  security: { label: 'Security', severity: 4, color: '#8b5cf6', icon: 'Shield', defaultActions: ['Lock down affected area', 'Send security team', 'Contact police', 'Secure evidence'] },
  flood: { label: 'Flood', severity: 3, color: '#3b82f6', icon: 'Droplets', defaultActions: ['Shut off water main', 'Send maintenance crew', 'Evacuate affected rooms', 'Deploy water pumps'] },
  trafficking: { label: 'Trafficking Alert', severity: 5, color: '#dc2626', icon: 'AlertTriangle', defaultActions: ['Alert security silently', 'Contact local authorities', 'Monitor all exits', 'Do not confront'] },
};

// ── Camera Zones ──
export const cameraZones = ['Lobby', 'Floor 2 Corridor', 'Restaurant', 'Parking Entrance'];

// ── Room/Zone to floor mapping ──
export function getFloorFromRoom(room) {
  const num = parseInt(room);
  if (isNaN(num)) return 0;
  return Math.floor(num / 100);
}

export function getRandomRoom() {
  const floor = Math.floor(Math.random() * 4) + 1;
  const room = Math.floor(Math.random() * 10) + 1;
  return `${floor}${String(room).padStart(2, '0')}`;
}
