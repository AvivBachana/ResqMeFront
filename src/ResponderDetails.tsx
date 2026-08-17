import { useEffect, useRef, type CSSProperties } from 'react';
import './ResponderDetails.css';
import {
  AED_DISTANCE_METERS,
  MAP_INCIDENT_POSITION_PCT,
  MAP_RESPONDER_START_POSITION_PCT,
  RESPONDER_DISTANCE_METERS,
  RESPONDER_ETA_MINUTES,
  RESPONDER_NAME,
  RESPONDER_PHONE_PLACEHOLDER,
  RESPONDER_QUALIFICATION,
  RESPONDER_SIM_STATUS_LABELS,
  SIMULATION_TICK_MS,
  formatEtaMinutes,
  formatMeters,
  getSimulationStatus,
  getTravelProgress,
  lerp,
} from './responderPoc';

interface ResponderDetailsProps {
  conditionTitle: string;
  /** Whether the responder has been requested at least once (lifted to the
   *  parent so the simulation can resume instead of restarting). */
  simRequested: boolean;
  /** Elapsed simulation time in ms, also owned by the parent. */
  simElapsedMs: number;
  /** Called on every tick while this screen is mounted; the parent just
   *  accumulates elapsed time — this screen owns no simulation state itself. */
  onSimTick: (deltaMs: number) => void;
  onBack: () => void;
  onContinueInstructions: () => void;
  onReturnToResults: () => void;
}

// Brand mark reused from the app's existing header/hero logo (same paths),
// duplicated locally since this screen renders its own header rather than
// the shared renderPageHeader.
function ResQmeMark() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M11 5.5 Q14 3.5 17 5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M9 4 Q14 1.5 19 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.28" />
      <circle cx="14" cy="6.5" r="1.6" fill="#FF6B6B" />
      <path d="M14 9L7.5 11.8V17c0 3.5 2.8 6.3 6.5 7 3.7-.7 6.5-3.5 6.5-7v-5.2L14 9z" fill="white" fillOpacity="0.85" />
      <circle cx="14" cy="14" r="2" fill="#C8192E" />
      <path d="M10.5 20 Q12 17.5 14 17.5 Q16 17.5 17.5 20" stroke="#C8192E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 21.5 L11 21.5 L12.2 19.5 L13.5 23 L14.8 18.5 L16 21.5 L17 21.5 L19 21.5" stroke="#FF6B6B" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.4" fill="white" />
      <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5c-2.3 0-4.2 1.8-4.2 4.1C3.8 8.9 8 14.5 8 14.5s4.2-5.6 4.2-8.9c0-2.3-1.9-4.1-4.2-4.1z" fill="#C8192E" />
      <circle cx="8" cy="5.6" r="1.5" fill="white" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.3" stroke="#656b73" strokeWidth="1.4" />
      <path d="M8 4.8V8.2L10.3 9.6" stroke="#656b73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartPulseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13.4S2.4 9.8 2.4 5.9C2.4 3.9 4 2.4 5.8 2.4c1 0 1.9.5 2.2 1.2C8.3 2.9 9.2 2.4 10.2 2.4c1.8 0 3.4 1.5 3.4 3.5 0 3.9-5.6 7.5-5.6 7.5Z" stroke="#656b73" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.6 7.2h1.6l1-1.7 1.2 3 .9-1.3h2.1" stroke="#656b73" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MarkerType = 'incident' | 'responder' | 'aed';

// A real pin shape (rounded head, pointed tip) rather than a plain circle,
// implemented as local SVG — no external icon library or map asset.
function MapMarker({
  type, className, label, style,
}: { type: MarkerType; className: string; label: string; style?: CSSProperties }) {
  const fill = type === 'incident' ? '#e21b2d' : type === 'aed' ? '#16a34a' : '#1267cf';
  return (
    <div className={className} aria-label={label} role="img" style={style}>
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none">
        <path
          d="M15 1.5C7.8 1.5 2 7.3 2 14.5c0 9.8 13 21.5 13 21.5s13-11.7 13-21.5C28 7.3 22.2 1.5 15 1.5Z"
          fill={fill}
          stroke="white"
          strokeWidth="1.6"
        />
        {type === 'incident' && (
          <text x="15" y="19.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">!</text>
        )}
        {type === 'responder' && (
          <text x="15" y="19" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">+</text>
        )}
        {type === 'aed' && (
          <path d="M16.4 8.5L11 15.8H14.6L13 20.5L19 13.2H15.2L16.4 8.5Z" fill="white" />
        )}
      </svg>
    </div>
  );
}

function NearbyResponderDetails({
  conditionTitle, simRequested, simElapsedMs, onSimTick, onBack, onContinueInstructions, onReturnToResults,
}: ResponderDetailsProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drive the simulation clock only while this screen is mounted; the
  // elapsed value itself lives in the parent, so leaving this screen and
  // coming back resumes from where the simulation left off instead of
  // restarting it. Cleared on unmount so no timer runs in the background.
  useEffect(() => {
    if (!simRequested) return;
    intervalRef.current = setInterval(() => onSimTick(SIMULATION_TICK_MS), SIMULATION_TICK_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRequested]);

  const status = getSimulationStatus(simElapsedMs);
  const progress = getTravelProgress(simElapsedMs);
  const currentDistanceMeters = RESPONDER_DISTANCE_METERS * (1 - progress);
  const currentEtaMinutes = RESPONDER_ETA_MINUTES * (1 - progress);
  const responderPos = {
    top: lerp(MAP_RESPONDER_START_POSITION_PCT.top, MAP_INCIDENT_POSITION_PCT.top, progress),
    left: lerp(MAP_RESPONDER_START_POSITION_PCT.left, MAP_INCIDENT_POSITION_PCT.left, progress),
  };

  return (
    <main className="responder-page" dir="rtl">
      <header className="responder-header">
        <div className="responder-header__top">
          <div className="responder-brand">
            <div className="responder-brand-mark">
              <ResQmeMark />
            </div>
            <span>ResQme</span>
          </div>

          <button type="button" className="responder-back-button" onClick={onBack}>
            <ChevronIcon />
            <span>חזרה</span>
          </button>
        </div>

        <div className="responder-demo-label">POC DEMO</div>
        <h1>איתור מע״ר קרוב</h1>
      </header>

      <section className="responder-sheet">
        {conditionTitle && (
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--resqme-muted)', textAlign: 'center', flexShrink: 0 }}>{conditionTitle}</p>
        )}

        <article className="responder-found-card">
          <div className="responder-found-card__icon">
            <UserIcon />
          </div>

          <div>
            <strong>נמצא מע״ר בקרבת מקום</strong>
            <span>{RESPONDER_NAME} · {RESPONDER_QUALIFICATION}</span>
          </div>
        </article>

        <section className="responder-map" aria-label="מפת מיקום המע״ר והאירוע">
          <div className="map-background" aria-hidden="true">
            <div className="map-park map-park--1" />
            <div className="map-park map-park--2" />
            <div className="map-building map-building--1" />
            <div className="map-building map-building--2" />
            <div className="map-building map-building--3" />
            <div className="map-building map-building--4" />
          </div>

          <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="82,26 70,42 55,38 42,52" />
          </svg>

          <MapMarker type="incident" className="map-marker map-marker--incident" label="מיקום האירוע" />
          <MapMarker
            type="responder"
            className="map-marker"
            label="המע״ר שבדרך"
            style={{ top: `${responderPos.top}%`, left: `${responderPos.left}%` }}
          />
          <MapMarker type="responder" className="map-marker map-marker--responder-secondary" label="מע״ר נוסף" />
          <MapMarker type="aed" className="map-marker map-marker--aed" label="דפיברילטור" />

          <div className="map-legend">
            <div><i className="legend-dot legend-dot--incident" />אירוע</div>
            <div><i className="legend-dot legend-dot--responder" />מע״ר</div>
            <div><i className="legend-dot legend-dot--aed" />דפיברילטור</div>
          </div>
        </section>

        <article className="responder-status-card">
          <div className="responder-status-card__title">
            <span className="status-indicator" />
            <strong>{RESPONDER_SIM_STATUS_LABELS[status]}</strong>
          </div>

          <dl className="responder-metrics">
            <div>
              <dt><PinIcon /></dt>
              <dd>מרחק: {formatMeters(currentDistanceMeters)}</dd>
            </div>

            <div>
              <dt><ClockIcon /></dt>
              <dd>זמן הגעה משוער: {formatEtaMinutes(currentEtaMinutes)}</dd>
            </div>

            <div>
              <dt><HeartPulseIcon /></dt>
              <dd>דפיברילטור קרוב: {formatMeters(AED_DISTANCE_METERS)}</dd>
            </div>
          </dl>

          <div className="responder-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%`, marginInlineStart: 0 }} />
          </div>

          <div className="responder-contact-row">
            <div>
              <strong>{RESPONDER_NAME}</strong>
              <span>{RESPONDER_QUALIFICATION}</span>
            </div>

            <button type="button" className="responder-contact-button" title={RESPONDER_PHONE_PLACEHOLDER}>
              פרטי קשר
            </button>
          </div>
        </article>

        <p className="responder-emergency-note">
          אין להמתין לסיוע. במקרה חירום יש להתקשר מיד ל־101.
        </p>

        <div className="responder-actions">
          <button type="button" className="responder-action responder-action--primary" onClick={onContinueInstructions}>
            המשך להנחיות הרפואיות
          </button>

          <button type="button" className="responder-action responder-action--secondary" onClick={onReturnToResults}>
            חזרה לתוצאות
          </button>
        </div>
      </section>
    </main>
  );
}

export default NearbyResponderDetails;
