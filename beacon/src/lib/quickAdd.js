import { isoDateOnly } from './format';

const PRIORITY_TOKENS = {
  '!urgent': 'urgent', '!u': 'urgent',
  '!high': 'high', '!h': 'high',
  '!medium': 'medium', '!med': 'medium', '!m': 'medium',
  '!low': 'low', '!l': 'low',
};

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAY_FULL = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function resolveWeekday(shortName) {
  const targetIdx = WEEKDAYS.indexOf(shortName);
  if (targetIdx === -1) return null;
  const today = new Date();
  const todayIdx = today.getDay();
  let diff = targetIdx - todayIdx;
  if (diff < 0) diff += 7;
  return isoDateOnly(addDays(today, diff));
}

/**
 * Parses free text like:
 *   "Call the ISP about the VPN cert tomorrow !high"
 * into { title, due_date, priority }.
 * Recognized date words: today, tomorrow/tmrw, weekday names, "next week".
 * Recognized priority words: !urgent/!u !high/!h !medium/!m !low/!l
 * Unrecognized text is left untouched in the title.
 */
export function parseQuickAdd(raw) {
  let text = raw.trim();
  let priority = 'medium';
  let due_date = null;

  const words = text.split(/\s+/);
  const kept = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const lower = w.toLowerCase();

    if (PRIORITY_TOKENS[lower]) {
      priority = PRIORITY_TOKENS[lower];
      continue;
    }
    if (lower === 'today') {
      due_date = isoDateOnly(new Date());
      continue;
    }
    if (lower === 'tomorrow' || lower === 'tmrw') {
      due_date = isoDateOnly(addDays(new Date(), 1));
      continue;
    }
    if (lower === 'next' && words[i + 1] && words[i + 1].toLowerCase() === 'week') {
      due_date = isoDateOnly(addDays(new Date(), 7));
      i += 1;
      continue;
    }
    const weekdayShort = WEEKDAY_FULL.includes(lower) ? lower.slice(0, 3) : (WEEKDAYS.includes(lower) ? lower : null);
    if (weekdayShort) {
      due_date = resolveWeekday(weekdayShort);
      continue;
    }

    kept.push(w);
  }

  return {
    title: kept.join(' ').trim(),
    due_date,
    priority,
  };
}

export const QUICK_ADD_HINT = "Try “tomorrow”, “fri”, “next week”, or “!high” / “!low”";
