// Lightweight, dependency-free table search filter.
// Any <input data-table-search="#some-table"> filters that table's <tbody> rows
// by matching their visible text against the query as the admin types.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-table-search]').forEach((input) => {
    const table = document.querySelector(input.getAttribute('data-table-search'));
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const emptyMessage = table.closest('.card')?.querySelector('[data-search-empty]');

    input.addEventListener('input', () => {
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
});

// Show/hide toggle for any <div class="password-field"> wrapping an <input> + <button class="pw-toggle">.
const EYE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.password-field').forEach((wrap) => {
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

  // Belt-and-braces: always hand back a blank sign-in form, even if the
  // browser restores this page from back/forward cache with old values.
  const loginForm = document.querySelector('[data-clear-on-load]');
  if (loginForm) {
    window.addEventListener('pageshow', () => loginForm.reset());
  }

  // Light/dark theme toggle, persisted in localStorage. Landing page ignores
  // this entirely (it's forced dark via its own stylesheet rules).
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
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
});
