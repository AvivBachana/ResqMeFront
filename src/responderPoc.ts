// Local, deterministic mock data for the "Nearby First Responder" POC.
//
// Everything here is fictional and fully offline: no real name, phone
// number, address, or GPS coordinate is used. Map positions are plain
// percentages within the responder-details map panel, not real coordinates.
// There is no network call and no randomness.

export const RESPONDER_NAME = 'דניאל כהן';
export const RESPONDER_QUALIFICATION = 'מגיש עזרה ראשונה מוסמך';
export const RESPONDER_DISTANCE_METERS = 620;
export const RESPONDER_ETA_MINUTES = 4;
export const AED_DISTANCE_METERS = 280;

// Obviously-reserved placeholder number (an all-zero subscriber block is
// never assigned to a real line) — shown for display only, never dialed.
export const RESPONDER_PHONE_PLACEHOLDER = '050-0000000';

export function formatMeters(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} ק״מ`;
  return `${Math.round(meters)} מטר`;
}

export function formatEtaMinutes(minutes: number): string {
  if (minutes <= 0.5) return 'הגיע למקום';
  return `${Math.ceil(minutes)} דקות`;
}

// --- Deterministic, timer-driven simulation timeline -----------------------
// Once the user requests the responder, elapsed time (tracked by the caller,
// e.g. App.tsx) is fed into these pure helpers to derive the current phase,
// travel progress, and live distance/ETA. No randomness, no network calls.

export type ResponderSimStatus = 'searching' | 'requesting' | 'accepted' | 'enroute' | 'arrived';

interface SimulationStep {
  atMs: number;
  status: ResponderSimStatus;
}

export const SIMULATION_TIMELINE: SimulationStep[] = [
  { atMs: 0, status: 'searching' },
  { atMs: 1500, status: 'requesting' },
  { atMs: 3200, status: 'accepted' },
  { atMs: 4200, status: 'enroute' },
  { atMs: 10200, status: 'arrived' },
];

export const TRAVEL_START_MS = 4200;
export const TRAVEL_END_MS = 10200;
export const SIMULATION_TICK_MS = 250;

export const RESPONDER_SIM_STATUS_LABELS: Record<ResponderSimStatus, string> = {
  searching: 'מאתר מע״ר בקרבת מקום',
  requesting: 'שולח בקשה למע״ר',
  accepted: 'הבקשה אושרה על ידי מע״ר',
  enroute: 'מע״ר בדרך',
  arrived: 'המע״ר הגיע למיקום',
};

export function getSimulationStatus(elapsedMs: number): ResponderSimStatus {
  let current = SIMULATION_TIMELINE[0].status;
  for (const step of SIMULATION_TIMELINE) {
    if (elapsedMs >= step.atMs) current = step.status;
  }
  return current;
}

// 0 before travel starts, 1 once the responder has reached the incident.
export function getTravelProgress(elapsedMs: number): number {
  if (elapsedMs <= TRAVEL_START_MS) return 0;
  if (elapsedMs >= TRAVEL_END_MS) return 1;
  return (elapsedMs - TRAVEL_START_MS) / (TRAVEL_END_MS - TRAVEL_START_MS);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Percent-based positions matching the .map-marker--incident /
// .map-marker--responder-primary CSS rules in ResponderDetails.css — kept
// here too so the animated marker's inline position can be computed from
// the same source of truth as the static CSS layout.
export const MAP_INCIDENT_POSITION_PCT = { top: 38, left: 51 };
export const MAP_RESPONDER_START_POSITION_PCT = { top: 42, left: 81 };
