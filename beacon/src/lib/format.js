export const PRIORITIES = ['urgent', 'high', 'medium', 'low'];

export const PRIORITY_LABEL = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function todayISO() {
  const d = new Date();
  return isoDateOnly(d);
}

export function isoDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return dueDate < todayISO();
}

export function isToday(dueDate) {
  return dueDate === todayISO();
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Human label for a YYYY-MM-DD date string, relative to today. */
export function dueLabel(dueDate) {
  if (!dueDate) return null;
  const today = todayISO();
  if (dueDate === today) return 'Today';

  const [y, m, d] = dueDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const now = new Date(ty, tm - 1, td);
  const diffDays = Math.round((target - now) / 86400000);

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return WEEKDAY_SHORT[target.getDay()];
  return `${MONTH_SHORT[target.getMonth()]} ${target.getDate()}`;
}

export function groupLabel(dueDate) {
  if (!dueDate) return 'No date';
  const today = todayISO();
  if (dueDate < today) return 'Overdue';
  if (dueDate === today) return 'Today';

  const [y, m, d] = dueDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const now = new Date(ty, tm - 1, td);
  const diffDays = Math.round((target - now) / 86400000);

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return WEEKDAY_SHORT[target.getDay()] + `, ${MONTH_SHORT[target.getMonth()]} ${target.getDate()}`;
  return `${MONTH_SHORT[target.getMonth()]} ${target.getDate()}`;
}

export function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function friendlyDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
