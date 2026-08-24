const db = require('../db');

/**
 * Picks who a new ticket should go to, so tickets don't pile onto one
 * technician: within the ticket's department, assign to whichever
 * technician currently has the fewest active (Open/In Progress) tickets.
 * Ties break on lowest user id, which keeps the pick deterministic and
 * self-corrects into a round-robin whenever technicians are equally loaded.
 * Returns null if the department has no technicians yet (ticket stays
 * unassigned until claimed or manually assigned).
 */
function pickLeastBusyTechnician(departmentId) {
  const row = db
    .prepare(
      `SELECT users.id
       FROM users
       LEFT JOIN tickets ON tickets.assigned_to = users.id AND tickets.status != 'Done'
       WHERE users.role = 'technician' AND users.department_id = ?
       GROUP BY users.id
       ORDER BY COUNT(tickets.id) ASC, users.id ASC
       LIMIT 1`
    )
    .get(departmentId);

  return row ? row.id : null;
}

module.exports = { pickLeastBusyTechnician };
