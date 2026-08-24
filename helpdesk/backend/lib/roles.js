const STAFF_ROLES = ['admin', 'technician'];

function isStaff(user) {
  return STAFF_ROLES.includes(user.role);
}

function homeFor(user) {
  return isStaff(user) ? '/admin' : '/dashboard';
}

module.exports = { STAFF_ROLES, isStaff, homeFor };
