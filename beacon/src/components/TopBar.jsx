import { MenuIcon, SunIcon, MoonIcon } from './Icons';
import { useTheme } from '../lib/useTheme';

export default function TopBar({ onMenuClick }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-row">
        <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <MenuIcon className="icon" />
        </button>
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="icon" /> : <MoonIcon className="icon" />}
          </button>
        </div>
      </div>
    </header>
  );
}
