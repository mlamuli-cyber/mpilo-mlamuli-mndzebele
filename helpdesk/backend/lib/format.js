function ticketNumber(id) {
  return `HD-${String(id).padStart(6, '0')}`;
}

// SQLite's datetime('now') returns UTC without a timezone suffix; append one so
// Date parses it correctly instead of treating it as local time.
function toDate(sqliteTimestamp) {
  return new Date(sqliteTimestamp.replace(' ', 'T') + 'Z');
}

function timeAgo(sqliteTimestamp) {
  const diffMs = Date.now() - toDate(sqliteTimestamp).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}

function withFormatted(ticket) {
  return { ...ticket, number: ticketNumber(ticket.id), age: timeAgo(ticket.created_at) };
}

module.exports = { ticketNumber, timeAgo, withFormatted };
