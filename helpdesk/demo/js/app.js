// Lightweight, dependency-free UI wiring: table search, password show/hide,
// and the light/dark theme toggle.
//
// In the real server-rendered app this only ever needs to run once, on
// DOMContentLoaded. In this standalone demo, the topbar nav (and sometimes
// whole tables) are injected into the page by JS *after* that point, so
// everything here is wrapped in `rewire()`, which is safe to call as many
// times as needed — it skips anything already wired via a `data-wired` flag.
(function () {
  const EYE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

  function wireTableSearch() {
    document.querySelectorAll('[data-table-search]:not([data-wired])').forEach((input) => {
      input.setAttribute('data-wired', '1');
      const table = document.querySelector(input.getAttribute('data-table-search'));
      if (!table) return;
      const emptyMessage = table.closest('.card')?.querySelector('[data-search-empty]');

      input.addEventListener('input', () => {
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;
        rows.forEach((row) => {
          const match = row.textContent.toLowerCase().includes(query);
          row.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
      });
    });
  }

  function wirePasswordToggles() {
    document.querySelectorAll('.password-field:not([data-wired])').forEach((wrap) => {
      wrap.setAttribute('data-wired', '1');
      const input = wrap.querySelector('input');
      const btn = wrap.querySelector('.pw-toggle');
      if (!input || !btn) return;
      btn.innerHTML = EYE_ICON;
      btn.addEventListener('click', () => {
        const willShow = input.type === 'password';
        input.type = willShow ? 'text' : 'password';
        btn.innerHTML = willShow ? EYE_OFF_ICON : EYE_ICON;
        btn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
        input.focus({ preventScroll: true });
      });
    });
  }

  function wireClearOnLoad() {
    const loginForm = document.querySelector('[data-clear-on-load]:not([data-wired])');
    if (loginForm) {
      loginForm.setAttribute('data-wired', '1');
      window.addEventListener('pageshow', () => loginForm.reset());
    }
  }

  function wireThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && !themeToggle.hasAttribute('data-wired')) {
      themeToggle.setAttribute('data-wired', '1');
      themeToggle.addEventListener('click', () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const current = document.documentElement.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
        } catch (e) {}
      });
    }
  }

  function rewire() {
    wireTableSearch();
    wirePasswordToggles();
    wireClearOnLoad();
    wireThemeToggle();
  }

  document.addEventListener('DOMContentLoaded', rewire);
  window.HDApp = { rewire };
})();
