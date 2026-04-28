import { mockStaff, getFloorFromRoom } from './mockData.js';

const ROLE_MAP = {
  fire: ['maintenance', 'security'],
  medical: ['first-aider'],
  security: ['security'],
  flood: ['maintenance'],
  trafficking: ['security', 'manager'],
};

function manhattanDistance(floor1, floor2, zone1, zone2) {
  const floorDist = Math.abs(floor1 - floor2);
  const zoneDist = zone1 === zone2 ? 0 : 1;
  return floorDist + zoneDist + 0.1; // prevent division by zero
}

function calculateScore(staff, crisisType, crisisFloor, crisisZone) {
  const matchingRoles = ROLE_MAP[crisisType] || ['security'];
  const roleMatch = matchingRoles.includes(staff.role) ? 2.0 : 0.5;
  const availability = staff.status === 'available' ? 1.0 : 0.0;
  const distance = manhattanDistance(staff.floor, crisisFloor, staff.zone, crisisZone);
  return (1 / distance) * roleMatch * availability;
}

function generateTaskMessage(staff, crisisType, room, zone) {
  const location = room ? `Room ${room}` : zone;
  const msgs = {
    fire: [
      `Proceed to ${location} — fire reported. Use stairwell B. Bring extinguisher.`,
      `Secure evacuation route near ${location}. Guide guests to assembly point.`,
      `Check water supply and sprinkler systems near ${location}.`,
    ],
    medical: [
      `Medical emergency at ${location}. Bring first-aid kit and AED.`,
      `Assist paramedics with access to ${location}. Clear corridors.`,
      `Stand by at ${location} for patient stabilization support.`,
    ],
    security: [
      `Proceed to ${location} — suspected intruder. Use stairwell B.`,
      `Secure perimeter around ${location}. No unauthorized entry.`,
      `Monitor CCTV feeds for ${location} area. Report movement.`,
    ],
    flood: [
      `Water leak at ${location}. Locate and shut off nearest valve.`,
      `Deploy water pumps to ${location}. Protect electrical panels.`,
      `Evacuate guests from ${location}. Check rooms below for damage.`,
    ],
    trafficking: [
      `Silent alert: suspicious activity at ${location}. Observe, do not confront.`,
      `Monitor all exits near ${location}. Report to authorities.`,
      `Secure surveillance footage for ${location}. Await law enforcement.`,
    ],
  };

  const typeMessages = msgs[crisisType] || msgs.security;
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

function estimateETA(staff, crisisFloor) {
  const floorDist = Math.abs(staff.floor - crisisFloor);
  const seconds = 30 + floorDist * 30 + Math.floor(Math.random() * 30);
  return `${seconds} sec`;
}

/**
 * Dispatch staff to a crisis
 * @param {string} crisisType - fire, medical, security, flood, trafficking
 * @param {string} room - Room number (optional)
 * @param {string} zone - Zone name (optional)
 * @param {number} severity - 1-5
 * @param {Array} staffList - Current staff list (optional, defaults to mockStaff)
 * @returns {{ assignments: Array, call911: boolean, broadcastAlert: boolean }}
 */
export function dispatchStaff(crisisType, room, zone, severity, staffList) {
  const staff = staffList || [...mockStaff];
  const crisisFloor = room ? getFloorFromRoom(room) : 0;
  const crisisZone = zone || 'Lobby';

  // Score each staff member
  const scored = staff
    .map(s => ({ ...s, score: calculateScore(s, crisisType, crisisFloor, crisisZone) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top 3
  const top = scored.slice(0, 3);
  const assignments = top.map(s => ({
    staffId: s.id,
    staffName: s.name,
    role: s.role,
    task: generateTaskMessage(s, crisisType, room, crisisZone),
    eta: estimateETA(s, crisisFloor),
    floor: s.floor,
    zone: s.zone,
  }));

  return {
    assignments,
    call911: severity >= 3,
    broadcastAlert: severity >= 2,
  };
}
