import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavRail from './NavRail';
import TopBar from './TopBar';
import { useData } from '../context/DataContext';
import { isOverdue, isToday } from '../lib/format';

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { tasks } = useData();

  const open = tasks.filter((t) => t.status !== 'done');
  const counts = {
    today: open.filter((t) => isToday(t.due_date) || isOverdue(t.due_date, t.status)).length,
    upcoming: open.filter((t) => t.due_date && !isToday(t.due_date) && !isOverdue(t.due_date, t.status)).length,
    inbox: open.filter((t) => !t.due_date).length,
  };

  return (
    <div className="app-shell">
      <NavRail open={navOpen} onClose={() => setNavOpen(false)} counts={counts} />
      <div className="main-col">
        <TopBar onMenuClick={() => setNavOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
