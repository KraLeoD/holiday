export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function getFirstDayOfWeek(year: number, month: number): number {
  // 0 = Sunday, 1 = Monday, ...
  return new Date(year, month, 1).getDay();
}

export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const from = formatDate(new Date(year, month, 1));
  const to = formatDate(new Date(year, month + 1, 0));
  return { from, to };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
