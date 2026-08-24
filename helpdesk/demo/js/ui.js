/**
 * Shared chrome for the demo: topbar nav, footer, and the "Demo Mode" banner.
 * Mirrors views/partials/nav.ejs and views/partials/footer.ejs from the real app.
 */
(function (window) {
  'use strict';

  function navIcon(paths) {
    return (
      '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      paths +
      '</svg>'
    );
  }

  var ICONS = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    tickets: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z"/><path d="M13 5v2M13 17v2M13 10.5v3"/>',
    departments: '<rect x="4" y="3" width="10" height="18"/><path d="M14 8h6v13h-6"/><path d="M7 7h.01M11 7h.01M7 11h.01M11 11h.01M7 15h.01M11 15h.01"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    myTickets: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z"/>',
    newTicket: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    brand: '<path d="M12 2 3 6.5V12c0 5.2 3.8 9.5 9 10 5.2-.5 9-4.8 9-10V6.5L12 2Z"/><path d="m9 12 2 2 4-4"/>',
  };

  function renderNav(user, active) {
    var HD = window.HD;
    var staff = HD.isStaff(user);
    var brandHref = staff ? 'admin.html' : 'dashboard.html';

    var links;
    if (staff) {
      links =
        '<a href="admin.html" class="' + (active === 'admin-dashboard' ? 'active' : '') + '">' + navIcon(ICONS.overview) + ' Overview</a>' +
        '<a href="admin-tickets.html" class="' + (active === 'admin-tickets' ? 'active' : '') + '">' + navIcon(ICONS.tickets) + ' All Tickets</a>';
      if (user.role === 'admin') {
        links +=
          '<a href="admin-departments.html" class="' + (active === 'admin-departments' ? 'active' : '') + '">' + navIcon(ICONS.departments) + ' Departments</a>' +
          '<a href="admin-users.html" class="' + (active === 'admin-users' ? 'active' : '') + '">' + navIcon(ICONS.users) + ' Users</a>';
      }
    } else {
      links =
        '<a href="dashboard.html" class="' + (active === 'dashboard' ? 'active' : '') + '">' + navIcon(ICONS.myTickets) + ' My Tickets</a>' +
        '<a href="ticket-new.html" class="' + (active === 'new-ticket' ? 'active' : '') + '">' + navIcon(ICONS.newTicket) + ' Log a Ticket</a>';
    }

    var HD_ = window.HD;
    var initials = HD_.initials(user.full_name);
    var companyBit = user.company ? ' · ' + HD_.escapeHtml(user.company) : '';

    return (
      '<header class="topbar">' +
      '<div class="topbar-inner">' +
      '<a class="brand" href="' + brandHref + '">' +
      '<span class="brand-mark">' + navIcon(ICONS.brand) + '</span>' +
      '<span class="brand-name">Help Desk</span>' +
      '</a>' +
      '<nav class="main-nav">' + links + '</nav>' +
      '<div class="topbar-right">' +
      '<button type="button" class="theme-toggle" id="theme-toggle" title="Toggle light / dark theme" aria-label="Toggle light / dark theme">' +
      navIcon(ICONS.sun).replace('nav-icon', 'nav-icon icon-sun') +
      navIcon(ICONS.moon).replace('nav-icon', 'nav-icon icon-moon') +
      '</button>' +
      '<div class="who">' +
      '<span class="avatar">' + initials + '</span>' +
      '<span class="who-text">' +
      '<span class="who-name">' + HD_.escapeHtml(user.full_name) + companyBit + '</span>' +
      '<span class="role-pill role-' + user.role + '">' + user.role + '</span>' +
      '</span>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm btn-icon" type="button" id="logout-btn" title="Log out">' +
      navIcon(ICONS.logout) + ' Log out' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</header>'
    );
  }

  function renderFooter() {
    return (
      '<footer class="site-footer">' +
      '<div class="site-footer-inner">' +
      '<div class="footer-brand">' +
      '<span class="brand-mark brand-mark-sm">' + navIcon(ICONS.brand) + '</span>' +
      '<span>Help Desk</span>' +
      '</div>' +
      '<div class="footer-status"><span class="status-dot"></span> All systems operational</div>' +
      '<div class="footer-meta">&copy; ' + new Date().getFullYear() + ' Help Desk · Internal Support Platform · v1.0 (demo)</div>' +
      '</div>' +
      '</footer>'
    );
  }

  function renderDemoBanner() {
    return (
      '<div class="demo-banner">' +
      '<span><strong>Demo mode</strong> — this is a self-contained showcase. Your changes are saved only in this browser.</span>' +
      '<span class="demo-banner-actions">' +
      '<a href="index.html#how-it-works">How this demo works</a>' +
      '<button type="button" class="link-reset" id="reset-demo-btn">Reset demo data</button>' +
      '</span>' +
      '</div>'
    );
  }

  function mountChrome(user, active) {
    var bannerRoot = document.getElementById('demo-banner-root');
    if (bannerRoot) bannerRoot.innerHTML = renderDemoBanner();

    var navRoot = document.getElementById('nav-root');
    if (navRoot) navRoot.innerHTML = renderNav(user, active);

    var footerRoot = document.getElementById('footer-root');
    if (footerRoot) footerRoot.innerHTML = renderFooter();

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        window.HD.logout();
        window.location.href = 'index.html';
      });
    }

    var resetBtn = document.getElementById('reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (window.confirm('Reset all demo data back to the starting sample? This clears anything you changed in this browser.')) {
          window.HD.resetDemoData();
        }
      });
    }

    // Re-run app.js's password-toggle/table-search/theme-toggle wiring now
    // that the nav (and its theme button) has just been injected into the DOM.
    if (window.HDApp && typeof window.HDApp.rewire === 'function') {
      window.HDApp.rewire();
    }
  }

  window.HDUI = {
    renderNav: renderNav,
    renderFooter: renderFooter,
    renderDemoBanner: renderDemoBanner,
    mountChrome: mountChrome,
  };
})(window);
