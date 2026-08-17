export function getConfidenceLabel(value: number | string | null | undefined): string {
  if (value == null) return '';

  const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace('%', '').trim());
  if (Number.isNaN(parsed)) return '';
  const normalized = parsed <= 1 ? parsed * 100 : parsed;

  if (normalized >= 80) return 'ודאות ברמה גבוהה';
  if (normalized >= 60) return 'ודאות ברמה בינונית';
  if (normalized >= 40) return 'ודאות ברמה נמוכה';
  return 'לא ודאי';
}
