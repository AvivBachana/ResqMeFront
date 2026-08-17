export type InstructionVideo = {
  src: string;
  title: string;
};

const CONDITION_VIDEO_MAP: Record<string, InstructionVideo> = {
  'דום לב': {
    src: '/videos/cardiac-arrest.mp4',
    title: 'הדגמה לטיפול בדום לב',
  },
  'התקף לב': {
    src: '/videos/heart-attack.mp4',
    title: 'הדגמה לטיפול בהתקף לב',
  },
  'שבץ מוחי': {
    src: '/videos/stroke.mp4',
    title: 'הדגמה לטיפול בשבץ מוחי',
  },
  'חנק': {
    src: '/videos/choking.mp4',
    title: 'הדגמה לטיפול בחנק',
  },
  'דימום מסיבי': {
    src: '/videos/severe-bleeding.mp4',
    title: 'הדגמה לעצירת דימום מסיבי',
  },
  'התקף אפילפטי': {
    src: '/videos/epileptic-seizure.mp4',
    title: 'הדגמה לטיפול בהתקף אפילפטי',
  },
};

export function getInstructionVideo(
  selectedConditionName: string | null | undefined,
): InstructionVideo | null {
  const normalizedCondition = selectedConditionName?.trim() ?? '';
  return CONDITION_VIDEO_MAP[normalizedCondition] ?? null;
}
