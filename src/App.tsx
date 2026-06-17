import { useEffect, useMemo, useRef, useState } from 'react';

type Page =
  | 'home'
  | 'assessment'
  | 'clarify'
  | 'summary'
  | 'instructions'
  | 'analysis'
  | 'practice'
  | 'practiceDetail'
  | 'history'
  | 'loading';

type HistoryItem = {
  id: number;
  date: string;
  source: string;
  title: string;
  confidence: string;
  mode: string;
  inputText?: string;
};

const practiceScenarios = ['חנק', 'כאבים בחזה', 'חשד לשבץ', 'פרכוס', 'דימום חמור'];

const scenarioDetails: Record<string, string> = {
  חנק: 'תרחיש חנק: אדם עם חסימה בדרכי הנשימה ומאבק לנשימה.',
  'כאבים בחזה': 'תרחיש כאבים בחזה: סימן להתקף לב או מצב קרדיאלי חמור.',
  'חשד לשבץ': 'תרחיש שבץ: חוסר תחושה בצד אחד של הגוף וקוצר דיבור.',
  פרכוס: 'תרחיש פרכוס: איבוד הכרה ותנועות בלתי נשלטות.',
  'דימום חמור': 'תרחיש דימום חמור: דימום בלתי נשלט שדורש עצירת זרם דם מהירה.',
};

const scenarioIconBg: Record<string, string> = {
  'חנק': 'bg-red-50',
  'כאבים בחזה': 'bg-orange-50',
  'חשד לשבץ': 'bg-purple-50',
  'פרכוס': 'bg-blue-50',
  'דימום חמור': 'bg-rose-50',
};

const scenarioIcons: Record<string, JSX.Element> = {
  'חנק': (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
      {/* Trachea tube */}
      <rect x="15" y="2" width="14" height="28" rx="7" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5"/>
      {/* Tracheal rings */}
      <line x1="15" y1="12" x2="29" y2="12" stroke="#EF4444" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round"/>
      <line x1="15" y1="18" x2="29" y2="18" stroke="#EF4444" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round"/>
      {/* Obstruction block */}
      <rect x="17" y="22" width="10" height="7" rx="2" fill="#EF4444"/>
      {/* X mark */}
      <path d="M19.5 24L24.5 27.5M24.5 24L19.5 27.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Blocked-air dashed arrow */}
      <path d="M22 32V40" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="2.5 2.5"/>
    </svg>
  ),
  'כאבים בחזה': (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
      {/* Heart shape */}
      <path d="M22 39C22 39 4 27 4 16C4 10.5 8.5 6 14 6C17.2 6 20 7.8 22 10.5C24 7.8 26.8 6 30 6C35.5 6 40 10.5 40 16C40 27 22 39 22 39Z" fill="#FECACA" stroke="#EF4444" strokeWidth="1.5"/>
      {/* Lightning bolt */}
      <path d="M26 8L17 23H23.5L19 37L31 19H24.5L28 8Z" fill="#EF4444"/>
    </svg>
  ),
  'חשד לשבץ': (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
      {/* Head */}
      <circle cx="19" cy="24" r="16" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5"/>
      {/* Brain hemisphere divider */}
      <line x1="19" y1="9" x2="19" y2="39" stroke="#7C3AED" strokeOpacity="0.3" strokeWidth="1"/>
      {/* Brain folds – left */}
      <path d="M9 20C11 17 14.5 19 12.5 22" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M9 28C11 25 14.5 27 12.5 30" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Brain folds – right */}
      <path d="M19 20C21 17 24.5 19 22.5 22" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M19 28C21 25 24.5 27 22.5 30" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Warning badge */}
      <circle cx="36" cy="10" r="8" fill="#7C3AED"/>
      <line x1="36" y1="6.5" x2="36" y2="11.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="36" cy="14.5" r="1.3" fill="white"/>
    </svg>
  ),
  'פרכוס': (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
      {/* Brain shape */}
      <path d="M8 21C8 12 14 6 22 6C30 6 36 12 36 21C36 28 30 33 22 33C14 33 8 28 8 21Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
      {/* Hemisphere divider */}
      <line x1="22" y1="6" x2="22" y2="33" stroke="#2563EB" strokeOpacity="0.3" strokeWidth="1"/>
      {/* Left folds */}
      <path d="M12 17C14 14 17.5 16 15.5 19" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M12 24C14 21 17.5 23 15.5 26" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      {/* Right folds */}
      <path d="M32 17C30 14 26.5 16 28.5 19" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M32 24C30 21 26.5 23 28.5 26" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      {/* EEG wave */}
      <path d="M3 40L8 36L12 40L17 31L22 40L27 36L31 40L36 33L41 40" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  'דימום חמור': (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
      {/* Arm / limb */}
      <rect x="4" y="17" width="36" height="12" rx="6" fill="#FECDD3" stroke="#BE123C" strokeWidth="1.5"/>
      {/* Bandage – vertical strip */}
      <rect x="18" y="11" width="8" height="24" rx="3" fill="white" stroke="#BE123C" strokeWidth="1.5"/>
      {/* Cross */}
      <line x1="22" y1="14" x2="22" y2="32" stroke="#BE123C" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="19" y1="23" x2="25" y2="23" stroke="#BE123C" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Blood drops */}
      <path d="M9 31C9 31 7 33.5 7 35C7 36.1 7.9 37 9 37C10.1 37 11 36.1 11 35C11 33.5 9 31 9 31Z" fill="#BE123C"/>
      <path d="M35 31C35 31 33 33.5 33 35C33 36.1 33.9 37 35 37C36.1 37 37 36.1 37 35C37 33.5 35 31 35 31Z" fill="#BE123C"/>
    </svg>
  ),
};

const HISTORY_KEY = 'resqme_history';

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
  catch { return []; }
}

function persistHistory(items: HistoryItem[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 100)));
}

const analysisSteps = [
  { step: 1, title: 'תמלול הדיבור' },
  { step: 2, title: 'זיהוי תסמינים' },
  { step: 3, title: 'הפעלת מנוע החלטה' },
  { step: 4, title: 'בחירת הנחיות בטוחות' },
];

const instructionSteps = [
  'התקשרו מיד למוקד חירום.',
  'סמנו את המקום בו ניכר דימום וחבשו לחיצה ישירה.',
  'עקבו אחר נשימות ונסו לשמור על נתיב אוויר פתוח.',
  'המתינו לצוות החירום ובצעו הנחיות נוספות בהתאם.',
];

// Verified demo inputs — fixed Hebrew sentences covering all DSS conditions (G01–G06) and clarification cases.
const verifiedExampleScenarios = [
  // Cardiac arrest, G01
  'הוא לא מגיב ולא נושם',
  'מחוסר הכרה ואין נשימה',
  'הוא התמוטט ולא רואים שהוא נושם',
  'היא נפלה פתאום, לא מגיבה ואין לה נשימה תקינה',
  // Heart attack, G02
  'יש לו כאב חזק בחזה וקוצר נשימה',
  'הוא מרגיש לחץ בחזה עם זיעה קרה ובחילה',
  'כואב לו מאוד בחזה והוא מתקשה לנשום',
  'הוא בהכרה אבל מתלונן על לחץ בחזה וקוצר נשימה',
  // Stroke, G03
  'הפנים שלו עקומות ויד אחת חלשה',
  'יש לה דיבור לא ברור וחולשה בצד אחד',
  'הוא מבולבל, הפה שלו עקום והוא לא מצליח להזיז יד אחת',
  'פתאום היא מדברת לא ברור ויש חולשה בצד ימין',
  // Choking, G04
  'הוא נחנק ולא מצליח לדבר',
  'אוכל תקוע לו בגרון ויש לו שיעול חלש',
  'היא מחזיקה את הגרון ולא מצליחה לנשום',
  'הוא נחנק בזמן אוכל, לא מצליח לדבר ומנסה לנשום',
  // Massive bleeding, G05
  'דם משפריץ מהרגל',
  'יש דימום מסיבי ותחבושת מתמלאת בדם מהר',
  'יורד לו המון דם מהיד וזה לא מפסיק',
  'יש פצע עמוק והרבה דם יוצא במהירות',
  // Epileptic seizure, G06
  'היא מפרכסת וכל הגוף נוקשה',
  'הוא רועד בלי שליטה והעיניים מתגלגלות',
  'יש לו תנועות בלתי רצוניות והוא לא מגיב',
  'היא על הרצפה, הגוף רועד ויש פרכוסים',
  // Clarification-oriented examples
  'יורד לו המון המון דם והוא לא נושם',
  'קשה לו לנשום והוא מחזיק את אזור החזה והגרון',
  'הוא לא מגיב ויש לו תנועות פרכוסיות',
  'היא מבולבלת, מדברת לא ברור ויש גם דימום',
];

type AlternativeCondition = {
  condition: string;
  confidence: number;
};

type ClarificationCandidate = {
  code: string;
  name: string;
  confidence: number;
};

type ClarificationData = {
  question_id: string;
  question_text: string;
  options: string[];
  candidate_conditions: string[];
  candidates: ClarificationCandidate[];
};

type AnalyzeResponse = {
  input_text: string;
  top_condition?: string | null;
  condition?: string | null;
  transcript?: string;
  confidence: number;
  urgency_level: string;
  status: string;
  needs_clarification: boolean;
  clarifying_question?: string | null;
  clarification?: ClarificationData | null;
  instructions: string[];
  safety_message: string;
  warnings?: string[];
  matched_symptoms: string[];
  alternative_conditions: AlternativeCondition[];
  // Semantic fields from backend
  top_condition_name?: string;
  top_confidence?: number;
  second_condition_name?: string | null;
  second_confidence?: number | null;
  selected_condition_name?: string;
  selected_confidence?: number;
  selected_forbidden_action?: string;
  second_forbidden_action?: string | null;
};

function App() {
  const [page, setPage] = useState<Page>('home');
  const [description, setDescription] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string | null>(null); // stores option index "0"|"1"|"2"
  const [instructionStep, setInstructionStep] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(loadHistory);
  const [analysisSource, setAnalysisSource] = useState('');
  const [analysisTarget, setAnalysisTarget] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<AnalyzeResponse | null>(null);
  const apiBase = ((import.meta as any).env?.VITE_API_BASE as string) || '';
  const [summaryOrigin, setSummaryOrigin] = useState<'assessment' | 'practice'>('assessment');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const exampleQueueRef = useRef<string[]>([]);

  useEffect(() => {
    if (page !== 'instructions' || !stepsContainerRef.current) return;
    const el = stepsContainerRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [instructionStep, page]);

  useEffect(() => {
    if (page !== 'loading') return;
    setLoadingStep(0);
    const id = setInterval(() => {
      setLoadingStep((s) => (s < 3 ? s + 1 : s));
    }, 1800);
    return () => clearInterval(id);
  }, [page]);

  useEffect(() => {
    if (page !== 'summary' || !apiResult) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} • ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const source = analysisSource === 'קול' ? 'קול' : summaryOrigin === 'practice' ? 'סימולציה' : 'טקסט';
    const mode = summaryOrigin === 'practice' ? 'תרגול' : 'חירום';
    const title = apiResult.selected_condition_name || (apiResult as any).condition || '';
    const confidence = `${Math.round((apiResult.selected_confidence ?? apiResult.confidence ?? 0) * 100)}%`;
    const inputText = (apiResult as any).transcript ?? description ?? selectedScenario ?? '';
    const newItem: HistoryItem = { id: Date.now(), date, source, title, confidence, mode, inputText };
    const updated = [newItem, ...historyItems].slice(0, 100);
    setHistoryItems(updated);
    persistHistory(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const canAnalyze = description.trim().length >= 10;
  const canContinue = clarificationAnswer !== null;

  // Scenario-only local defaults (used only for practice-preview, not as silent fallback)
  const result = useMemo(() => {
    if (!selectedScenario) return null;

    switch (selectedScenario) {
      case 'חנק':
        return { title: 'חנק', confidence: '87%', symptoms: ['קושי בנשימה', 'חנק', 'שיעול'] };
      case 'כאבים בחזה':
        return { title: 'כאבים בחזה', confidence: '92%', symptoms: ['כאבים חזקים בחזה', 'קוצר נשימה', 'זיעה קרה'] };
      case 'חשד לשבץ':
        return { title: 'חשד לשבץ', confidence: '78%', symptoms: ['חולשה בצד אחד', 'קושי בדיבור', 'בלבול'] };
      case 'פרכוס':
        return { title: 'פרכוס', confidence: '85%', symptoms: ['תזוזות בלתי רצוניות', 'איבוד הכרה', 'נשימה לא סדירה'] };
      case 'דימום חמור':
        return { title: 'דימום חמור', confidence: '95%', symptoms: ['דימום כבד', 'חולשה', 'עור חיוור'] };
      default:
        return null;
    }
  }, [selectedScenario]);

  const formatConfidence = (v: any) => {
    if (v == null) return '';
    if (typeof v === 'number') return v <= 1 ? `${Math.round(v * 100)}%` : `${Math.round(v)}%`;
    return String(v);
  };

  const displayResult = useMemo(() => {
    if (!apiResult) return null;

    const title = apiResult.selected_condition_name || (apiResult as any).condition || '';
    const confidence = formatConfidence(apiResult.selected_confidence ?? (apiResult as any).confidence);
    const symptoms = apiResult.matched_symptoms && apiResult.matched_symptoms.length > 0
      ? apiResult.matched_symptoms
      : (result ? result.symptoms : []);

    return { title, confidence, symptoms };
  }, [apiResult, result]);

  const displayInstructions = apiResult?.instructions ?? instructionSteps;

  const resetState = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setPage('home');
    setDescription('');
    setSelectedScenario(null);
    setClarificationAnswer(null);
    setInstructionStep(0);
    setSelectedHistory(null);
    setAnalysisSource('');
    setAnalysisTarget('');
    setApiError(null);
    setApiResult(null);
  };

  const handleAnalyze = async () => {
    setApiError(null);
    setApiLoading(true);
    setAnalysisSource(summaryOrigin === 'practice' ? 'תרגול' : 'הערכת חירום');
    setAnalysisTarget(summaryOrigin === 'practice' ? selectedScenario ?? 'תרחיש תרגול' : description);

    try {
      const payload = { text: summaryOrigin === 'practice' ? (selectedScenario ?? '') : description };
      const url = `${apiBase.replace(/\/$/, '')}/analyze-text`;
      console.log('Sending analysis request', { text: payload.text }, 'url', url);

      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('API error details:', body);
        throw new Error(body.detail || `HTTP ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      console.log('Parsed API response:', data);
      setApiResult(data);

      if (data.needs_clarification && data.status === 'needs_clarification' && data.clarification != null) {
        setPage('clarify');
      } else {
        setPage('summary');
      }
    } catch (err: any) {
      console.error('Analysis request failed:', err);
      const msg = err?.message ?? String(err);
      const hint = /failed to fetch|network error/i.test(msg) ? ' — בדקו CORS או חיבור השרת (הוסיפו CORS לשרת או עדכנו VITE_API_BASE)' : '';
      setApiError(msg + hint);
      // stay on assessment page so user can retry; do not show silent fallback
      setPage('assessment');
    } finally {
      setApiLoading(false);
    }
  };

  const handleUseExample = () => {
    if (exampleQueueRef.current.length === 0) {
      // Refill with a Fisher-Yates shuffle so all examples cycle before repeating.
      const shuffled = [...verifiedExampleScenarios];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Prevent the first pick of the new cycle matching the last-set description.
      if (shuffled[0] === description && shuffled.length > 1) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      }
      exampleQueueRef.current = shuffled;
    }
    setDescription(exampleQueueRef.current.shift()!);
  };

  const handleContinueFromClarify = async () => {
    if (!canContinue) return;
    setApiError(null);
    setApiLoading(true);
    try {
      const originalText = summaryOrigin === 'practice' ? (selectedScenario ?? '') : description;
      const questionId = apiResult?.clarification?.question_id ?? '';
      const url = `${apiBase.replace(/\/$/, '')}/clarify`;
      const payload = { text: originalText, question_id: questionId, answer_index: clarificationAnswer ?? '2' };
      console.log('Sending /clarify request', payload);

      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `API error ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      console.log('Parsed /clarify response:', data);
      setApiResult(data);
      setPage('summary');
    } catch (err: any) {
      console.error('Continue from clarify failed:', err);
      setApiError(err?.message ?? 'שגיאה בחיבור לשרת');
      setPage('clarify');
    } finally {
      setApiLoading(false);
    }
  };

  const handleStartPractice = async () => {
    if (!selectedScenario) return;
    setSummaryOrigin('practice');
    setAnalysisSource('תרגול');
    setAnalysisTarget(selectedScenario);
    setApiError(null);
    setApiLoading(true);

    try {
      const payload = { text: selectedScenario };
      const url = `${apiBase.replace(/\/$/, '')}/analyze-text`;
      console.log('Sending practice analysis request', { text: payload.text }, 'url', url);

      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('API error details:', body);
        throw new Error(`API error ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      console.log('Parsed API response:', data);
      setApiResult(data);

      if (data.needs_clarification && data.status === 'needs_clarification' && data.clarification != null) {
        setPage('clarify');
      } else {
        setPage('summary');
      }
    } catch (err: any) {
      console.error('Start practice failed:', err);
      const msg = err?.message ?? 'שגיאה בחיבור לשרת';
      const hint = /failed to fetch|network error/i.test(msg) ? ' — בדקו CORS או חיבור השרת (הוסיפו CORS לשרת או עדכנו VITE_API_BASE)' : '';
      setApiError(msg + hint);
      // stay on practiceDetail so user can retry
      setPage('practiceDetail');
    } finally {
      setApiLoading(false);
    }
  };

  const handleStartRecording = async () => {
    setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setApiLoading(true);
        setSummaryOrigin('assessment');
        setAnalysisSource('קול');
        setPage('loading');
        try {
          const form = new FormData();
          form.append('file', blob, `recording.${mimeType.split('/')[1]}`);
          const url = `${apiBase.replace(/\/$/, '')}/analyze-audio`;
          const res = await fetch(url, { method: 'POST', mode: 'cors', body: form });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.detail || `HTTP ${res.status}`);
          }
          const data: AnalyzeResponse = await res.json();
          setApiResult(data);
          setAnalysisTarget(data.input_text ?? '');
          if (data.needs_clarification && data.status === 'needs_clarification' && data.clarification != null) { setPage('clarify'); } else { setPage('summary'); }
        } catch (err: any) {
          const msg = err?.message ?? String(err);
          setApiError(msg);
          setPage('assessment');
        } finally {
          setApiLoading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setApiError('לא ניתן לגשת למיקרופון. אנא אשרו הרשאת מיקרופון בדפדפן.');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const handleNextInstruction = () => {
    if (instructionStep < displayInstructions.length - 1) {
      setInstructionStep((current) => current + 1);
    } else {
      resetState();
    }
  };

  const handleBack = () => {
    if (page === 'clarify') {
      setPage('assessment');
      return;
    }

    if (page === 'summary') {
      setPage(summaryOrigin === 'practice' ? 'practiceDetail' : 'clarify');
      return;
    }

    if (page === 'instructions') {
      setPage('summary');
      return;
    }

    if (page === 'analysis') {
      setPage('summary');
      return;
    }

    if (page === 'practiceDetail') {
      setPage('practice');
      return;
    }

    if (page === 'history') {
      setPage('home');
      return;
    }

    resetState();
  };

  const pageTitleProps = {
    className: 'text-3xl font-bold text-foreground mb-2',
  };

  const logoSvg = (
    <svg viewBox="0 0 28 28" width="30" height="30" fill="none">
      <path d="M14 9L7.5 11.8V17c0 3.5 2.8 6.3 6.5 7 3.7-.7 6.5-3.5 6.5-7v-5.2L14 9z" fill="white" fillOpacity="0.9" />
      <circle cx="14" cy="14" r="2" fill="#C8192E" />
      <path d="M9 21.5 L11 21.5 L12.2 19.5 L13.5 23 L14.8 18.5 L16 21.5 L19 21.5" stroke="#FF6B6B" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const renderPageHeader = (title: string) => (
    <div style={{
      background: '#C8192E',
      padding: '1.25rem 1.5rem 2.5rem',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: -30, left: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -15, right: -15, width: 100, height: 100, background: 'rgba(0,0,0,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Logo + back */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, background: 'rgba(255,255,255,0.15)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {logoSvg}
          </div>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>ResQme</span>
        </div>
        <button
          type="button"
          onClick={handleBack}
          style={{ color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.13)', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          חזרה
        </button>
      </div>

      {/* Page title */}
      <h1 style={{ position: 'relative', zIndex: 1, color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', margin: 0 }}>{title}</h1>
    </div>
  );

  const errorBanner = apiError ? (
    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex-shrink-0">
      <strong>שגיאה:</strong> {apiError}
      <button type="button" className="ml-3 underline text-sm" onClick={() => setApiError(null)}>סגור</button>
    </div>
  ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-[390px] h-[844px] bg-background shadow-2xl overflow-hidden">
        <div className="h-full bg-background flex flex-col">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col">

            {page === 'home' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* ── RED HERO ── */}
                <div style={{
                  background: '#C8192E',
                  padding: '2.5rem 1.5rem 3.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 20, left: 60, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -20, right: -20, width: 120, height: 120, background: 'rgba(0,0,0,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

                  {/* Logo row */}
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 28 28" width="44" height="44" fill="none">
                        <path d="M11 5.5 Q14 3.5 17 5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
                        <path d="M9 4 Q14 1.5 19 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.28" />
                        <circle cx="14" cy="6.5" r="1.6" fill="#FF6B6B" />
                        <path d="M14 9L7.5 11.8V17c0 3.5 2.8 6.3 6.5 7 3.7-.7 6.5-3.5 6.5-7v-5.2L14 9z" fill="white" fillOpacity="0.85" />
                        <circle cx="14" cy="14" r="2" fill="#C8192E" />
                        <path d="M10.5 20 Q12 17.5 14 17.5 Q16 17.5 17.5 20" stroke="#C8192E" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M9 21.5 L11 21.5 L12.2 19.5 L13.5 23 L14.8 18.5 L16 21.5 L17 21.5 L19 21.5" stroke="#FF6B6B" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>ResQme</span>
                  </div>

                  {/* Status card */}
                  <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '1rem 1.25rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>מצב נוכחי</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>מוכן לפעולה</span>
                    </div>
                  </div>
                </div>

                {/* ── WHITE CONTENT PANEL ── */}
                <div style={{
                  background: 'var(--background)',
                  borderRadius: '24px 24px 0 0',
                  marginTop: -20,
                  position: 'relative',
                  zIndex: 2,
                  padding: '1.5rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--muted)', borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: '0.5px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <circle cx="11" cy="11" r="9.5" stroke="#C8192E" strokeWidth="1.5" />
                          <path d="M11 6.5V11.5L13.5 14" stroke="#C8192E" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>זמן תגובה</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{"< 3 דק'"}</div>
                    </div>
                    <div style={{ background: 'var(--muted)', borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: '0.5px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M11 2L4 5.5V11C4 15 7.1 18.5 11 19.5C14.9 18.5 18 15 18 11V5.5L11 2Z" stroke="#C8192E" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M8 11L10.5 13.5L14.5 8.5" stroke="#C8192E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>אירועים טופלו</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>2,400+</div>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      background: '#C8192E',
                      color: 'white',
                      border: 'none',
                      borderRadius: 14,
                      padding: '1rem',
                      fontSize: 16,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      marginBottom: 10,
                      letterSpacing: '-0.2px',
                    }}
                    onClick={() => { setSummaryOrigin('assessment'); setPage('assessment'); }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 1.5L3 5.5V11C3 15.3 6.1 19.2 10 20C13.9 19.2 17 15.3 17 11V5.5L10 1.5Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.3" />
                      <path d="M7 10L9.5 12.5L13.5 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    התחלת הערכת חירום
                  </button>

                  {/* Secondary CTA */}
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      background: 'var(--muted)',
                      color: 'var(--foreground)',
                      border: '0.5px solid var(--border)',
                      borderRadius: 14,
                      padding: '1rem',
                      fontSize: 16,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      marginBottom: '1.5rem',
                    }}
                    onClick={() => setPage('practice')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7 4.5L15.5 10L7 15.5V4.5Z" fill="currentColor" />
                    </svg>
                    תרגול סימולציה
                  </button>

                  {/* History row */}
                  <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => setPage('history')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6.5" stroke="var(--muted-foreground)" strokeWidth="1.2" />
                          <path d="M8 5V8.5L10 10" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize: 15, color: 'var(--muted-foreground)' }}>היסטוריית אירועים</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#C8192E' }}>
                          {historyItems.length === 0 ? 'אין אירועים' : `${historyItems.length} אירועים אחרונים`}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9 3L5 7L9 11" stroke="#C8192E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {page === 'assessment' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('הערכת חירום')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  {errorBanner}
                  <p className="text-sm text-muted-foreground mb-4">ספרו בקצרה מה קרה ומה אתם רואים</p>

                  <div className="bg-card rounded-2xl p-5 shadow-md border border-border space-y-5 mb-4">
                    <button
                      type="button"
                      className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${isRecording ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={apiLoading}
                    >
                      {isRecording ? '⏹ עצור הקלטה' : '🎙 התחלת הקלטה'}
                    </button>
                    {isRecording && (
                      <p className="text-xs text-destructive text-center animate-pulse">מקליט… לחצו עצור כשתסיימו</p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground">או</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground">⌨</span>
                        הקלידו תיאור קצר של האירוע
                      </label>
                      <textarea
                        className="w-full bg-input-background border border-border rounded-xl p-4 min-h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="הקלידו תיאור קצר של האירוע"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                    >
                      ניתוח מצב החירום
                    </button>
                    <button
                      type="button"
                      className="w-full text-secondary hover:text-secondary/80 py-2 transition-all"
                      onClick={handleUseExample}
                    >
                      <span className="text-sm underline">שימוש בתרחיש לדוגמה</span>
                    </button>
                  </div>

                  <div className="bg-accent rounded-xl p-4 border border-border mt-4">
                    <p className="text-xs text-muted-foreground text-center">אין צורך להזין פרטים רפואיים אישיים</p>
                  </div>
                </div>
              </section>
            )}

            {page === 'clarify' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('שאלת הבהרה')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {errorBanner}

                {/* Matched symptoms */}
                {apiResult?.matched_symptoms && apiResult.matched_symptoms.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">תסמינים שזוהו:</p>
                    <div className="flex flex-wrap gap-2">
                      {apiResult.matched_symptoms.map((s) => (
                        <span key={s} className="text-xs bg-muted text-foreground rounded-full px-3 py-1">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top two competing conditions */}
                {apiResult?.top_condition_name && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">מצבים מובילים:</p>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-foreground">{apiResult.top_condition_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          רמת התאמה: {Math.round((apiResult.top_confidence ?? 0) * 100)}%
                        </p>
                      </div>
                      {apiResult.second_condition_name && (
                        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
                          <p className="text-sm font-bold text-foreground">{apiResult.second_condition_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            רמת התאמה: {Math.round((apiResult.second_confidence ?? 0) * 100)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-accent rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    נמצאו סימנים שמתאימים ליותר ממצב אחד, לכן נבקש לענות על שאלה אחת כדי לבחור הנחיה בטוחה יותר.
                  </p>
                </div>

                {/* Temporary safety warning for second condition */}
                {apiResult?.second_forbidden_action && apiResult?.second_condition_name && apiResult?.second_confidence != null && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-800 leading-relaxed">
                      מאחר שיש סיכוי של {Math.round(apiResult.second_confidence * 100)}% ל{apiResult.second_condition_name}, בשלב זה ננחה אתכם לא לעשות:{' '}
                      <span className="font-semibold">{apiResult.second_forbidden_action}</span>
                    </p>
                  </div>
                )}

                {/* Clarification question */}
                {apiResult?.clarification?.question_text && (
                  <p className="text-base font-medium text-foreground">{apiResult.clarification.question_text}</p>
                )}

                <div className="space-y-3 flex-1">
                  {(apiResult?.clarification?.options ?? ['כן', 'לא', 'לא בטוח/ה']).map((option, idx) => {
                    const idxStr = String(idx);
                    const isSelected = clarificationAnswer === idxStr;
                    return (
                      <button
                        key={idxStr}
                        type="button"
                        className={`w-full border-2 rounded-xl p-4 transition-all bg-card hover:bg-accent border-border ${isSelected ? 'border-primary' : ''}`}
                        onClick={() => setClarificationAnswer(idxStr)}
                      >
                        <span className="text-foreground">{option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleContinueFromClarify}
                    disabled={!canContinue}
                  >
                    המשך ניתוח
                  </button>
                  <button
                    type="button"
                    className="w-full text-secondary hover:text-secondary/80 py-3 transition-all"
                    onClick={() => setPage('assessment')}
                  >
                    <span className="text-base underline">חזרה לתיאור האירוע</span>
                  </button>
                </div>
                </div>
              </section>
            )}

            {page === 'summary' && displayResult && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('תוצאות הניתוח')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {errorBanner}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-primary">דחיפות גבוהה</span>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-5 mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-1">{displayResult.title}</h2>
                      <p className="text-sm text-muted-foreground">רמת התאמה: {displayResult.confidence}</p>
                    </div>
                    <div className="bg-primary rounded-full p-3 flex items-center justify-center">
                      <span className="text-white">!</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-foreground">תסמינים שזוהו:</h3>
                    {displayResult.symptoms.map((symptom) => (
                      <div key={symptom} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{symptom}</span>
                      </div>
                    ))}
                  </div>

                  {apiResult?.selected_forbidden_action && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-base font-semibold text-destructive mb-2">מה לא לעשות</h3>
                      <p className="text-sm text-foreground">{apiResult.selected_forbidden_action}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-5 shadow-md transition-all"
                    onClick={() => {
                      setInstructionStep(0);
                      setPage('instructions');
                    }}
                  >
                    הצגת הנחיות מיידיות
                  </button>
                  <button
                    type="button"
                    className="w-full bg-card hover:bg-accent text-foreground border border-border rounded-xl px-8 py-4 transition-all"
                    onClick={() => setPage('analysis')}
                  >
                    הצגת ניתוח המערכת
                  </button>
                </div>
                </div>
              </section>
            )}

            {page === 'instructions' && displayResult && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <style>{`
                  @keyframes stepReveal {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                  .step-reveal { animation: stepReveal 0.38s cubic-bezier(0.16,1,0.3,1) both; }
                `}</style>
                {renderPageHeader('הנחיות מיידיות')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {errorBanner}

                {/* Subtitle + Progress bar */}
                <div className="flex-shrink-0 mb-1">
                  <p className="text-sm text-muted-foreground mb-3">{displayResult.title}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.round(((instructionStep + 1) / displayInstructions.length) * 100)}%`,
                        backgroundColor: 'rgb(200,16,46)',
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {instructionStep + 1} / {displayInstructions.length}
                  </span>
                </div>

                {/* Scrollable progressive steps */}
                <div ref={stepsContainerRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-2">
                  {displayInstructions.slice(0, instructionStep + 1).map((instruction, idx) => {
                    const isDone = idx < instructionStep;
                    const isCurrent = idx === instructionStep;
                    return (
                      <div key={idx} className="step-reveal">
                        <div
                          className={`rounded-2xl border transition-colors duration-300 ${
                            isCurrent
                              ? 'bg-white border-primary shadow-lg'
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-start gap-4 p-4">
                            {/* Badge */}
                            <div
                              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5 shadow-sm transition-colors duration-300"
                              style={{
                                backgroundColor: isDone ? 'rgb(34,197,94)' : 'rgb(200,16,46)',
                              }}
                            >
                              {isDone ? (
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                  <path d="M3.5 9.5L7 13L14.5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <span className="text-white font-bold text-sm">{idx + 1}</span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold mb-1.5 ${
                                isDone ? 'text-green-600' : 'text-primary'
                              }`}>
                                {isDone ? 'הושלם' : `שלב ${idx + 1}`}
                              </p>
                              <p className={`text-sm leading-relaxed ${
                                isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {instruction}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom actions */}
                <div className="flex-shrink-0 pt-4 mt-2 border-t border-border space-y-3">
                  <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-5 shadow-md transition-all font-medium"
                    onClick={handleNextInstruction}
                  >
                    {instructionStep < displayInstructions.length - 1 ? 'השלב הבא' : 'סיום וחזרה לבית'}
                  </button>
                  <button
                    type="button"
                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-4 py-4 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    חיוג חירום
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    בצעו רק פעולות שאתם מבינים. במקרה של ספק, התקשרו למוקד חירום.
                  </p>
                </div>
                </div>
              </section>
            )}

            {page === 'analysis' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('ניתוח המערכת')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {errorBanner}
                <p className="text-sm text-muted-foreground mb-4">אנא המתינו בזמן שאנו מעבדים את המידע</p>
                <div className="space-y-4 flex-1">
                  {analysisSteps.map((item) => (
                    <article key={item.step} className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold">
                        {item.step}
                      </span>
                      <div className="text-base font-semibold text-foreground">{item.title}</div>
                    </article>
                  ))}

                  {apiResult && (
                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm mt-4 text-sm text-foreground">
                      <h3 className="font-bold mb-2">פרטי ניתוח מהמנוע</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Status:</div><div className="text-foreground">{apiResult.status}</div>
                        <div>Condition:</div><div className="text-foreground">{apiResult.top_condition ?? '-'}</div>
                        <div>Urgency:</div><div className="text-foreground">{apiResult.urgency_level}</div>
                        <div>Confidence:</div><div className="text-foreground">{`${Math.round(apiResult.confidence * 100)}%`}</div>
                      </div>
                      <div className="mt-3">
                        <strong>Matched symptoms:</strong>
                        <ul className="list-disc list-inside mt-2 text-foreground">
                          {apiResult.matched_symptoms.map((s) => (<li key={s}>{s}</li>))}
                        </ul>
                      </div>
                      <div className="mt-3">
                        <strong>Safety Notes:</strong>
                        <p className="text-foreground mt-2">{apiResult.safety_message}</p>
                      </div>
                      {apiResult.alternative_conditions.length > 0 && (
                        <div className="mt-3">
                          <strong>Alternative Conditions:</strong>
                          <ul className="list-disc list-inside mt-2 text-foreground">
                            {apiResult.alternative_conditions.map((ac) => (
                              <li key={ac.condition}>{ac.condition} ({Math.round(ac.confidence * 100)}%)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-sm text-muted-foreground">מקור: {analysisSource}<br />{analysisTarget}</p>
                  <button type="button" className="w-full text-secondary hover:text-secondary/80 py-3 transition-all" onClick={resetState}>
                    <span className="text-base underline">חזור למסך הבית</span>
                  </button>
                </div>
                </div>
              </section>
            )}

            {page === 'practice' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('מצב תרגול')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {errorBanner}
                <p className="text-sm text-muted-foreground mb-4">בחרו תרחיש חירום לדוגמה</p>
                <div className="space-y-4 flex-1">
                  {practiceScenarios.map((scenario) => (
                    <button
                      key={scenario}
                      type="button"
                      className="w-full bg-card hover:bg-accent border border-border rounded-xl p-4 shadow-sm transition-all flex items-center gap-4"
                      onClick={() => { setSelectedScenario(scenario); setPage('practiceDetail'); }}
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${scenarioIconBg[scenario] ?? 'bg-muted'}`}>
                        {scenarioIcons[scenario]}
                      </div>
                      <span className="text-lg font-bold text-foreground">{scenario}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-accent/50 rounded-xl p-4 border border-border mt-4">
                  <p className="text-sm text-muted-foreground text-center">התרחישים משמשים לתרגול בלבד ולא מהווים ייעוץ רפואי אמיתי</p>
                </div>
                </div>
              </section>
            )}

            {page === 'practiceDetail' && selectedScenario && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader(`תרחיש: ${selectedScenario}`)}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {errorBanner}
                <p className="text-sm text-muted-foreground mb-6">{scenarioDetails[selectedScenario]}</p>
                <div className="space-y-3 mt-auto">
                  <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-5 shadow-md transition-all"
                    onClick={handleStartPractice}
                  >
                    הפעל תרחיש
                  </button>
                  <button
                    type="button"
                    className="w-full bg-card hover:bg-accent text-foreground border border-border rounded-xl px-8 py-5 transition-all"
                    onClick={() => setPage('practice')}
                  >
                    בחירת תרחיש אחר
                  </button>
                </div>
                </div>
              </section>
            )}

            {page === 'history' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('היסטוריית אירועים')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {errorBanner}
                <p className="text-sm text-muted-foreground mb-4">ניתוחים והערכות קודמות</p>
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  {historyItems.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm pt-8">אין היסטוריה עדיין. בצעו ניתוח חירום או תרגול כדי להתחיל.</p>
                  )}
                  {historyItems.map((item) => (
                    <article key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                          <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                            <span className="text-xs font-medium text-muted-foreground">{item.source}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">רמת ודאות: {item.confidence}</p>
                          </div>
                          <button
                            type="button"
                            className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-4 py-2 transition-all"
                            onClick={() => setSelectedHistory(item)}
                          >
                            פתיחת פרטים
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                </div>
              </section>
            )}

            {page === 'loading' && (
              <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderPageHeader('מנתחים...')}
                <div style={{ background: 'var(--background)', borderRadius: '24px 24px 0 0', marginTop: -20, position: 'relative', zIndex: 2, padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p className="text-sm text-muted-foreground mb-4">אנא המתינו בזמן שאנו מעבדים את המידע</p>
                <div className="space-y-4 flex-1">
                  {analysisSteps.map((item, idx) => {
                    const done = idx < loadingStep;
                    const current = idx === loadingStep;
                    const pending = idx > loadingStep;
                    return (
                      <article key={item.step} className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4 transition-all">
                        {done && (
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(200,16,46)' }}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path d="M3.5 9.5L7 13L14.5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                        {current && (
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 animate-spin" style={{ border: '3px solid rgb(229,229,229)', borderTopColor: 'rgb(200,16,46)', borderRightColor: 'rgb(200,16,46)' }} />
                        )}
                        {pending && (
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(229,229,229)' }} />
                        )}
                        <div className="text-base font-semibold transition-colors duration-500" style={{ color: pending ? 'rgb(107,114,128)' : 'rgb(26,26,26)' }}>
                          {item.title}
                        </div>
                      </article>
                    );
                  })}
                </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {selectedHistory && (
        <div className="fixed inset-0 grid place-items-center bg-black/50 p-6">
          <div className="w-full max-w-md bg-background rounded-2xl p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">{selectedHistory.title}</h2>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedHistory(null)}>
                ✕
              </button>
            </div>
            <div className="space-y-3 mt-4 text-muted-foreground">
              <p>תאריך: {selectedHistory.date}</p>
              <p>מקור: {selectedHistory.source}</p>
              <p>אופי אירוע: {selectedHistory.mode}</p>
              <p>רמת ודאות: {selectedHistory.confidence}</p>
              {selectedHistory.inputText && (
                <div className="pt-1">
                  <p className="text-sm font-medium text-foreground mb-1">תיאור הבקשה:</p>
                  <p className="text-sm bg-muted rounded-lg p-3 text-foreground leading-relaxed">{selectedHistory.inputText}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl px-5 py-3 transition-all" onClick={() => setSelectedHistory(null)}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
