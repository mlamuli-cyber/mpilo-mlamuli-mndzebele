import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  BeaconMark, TodayIcon, UpcomingIcon, InboxIcon, ListIcon, PlusIcon,
  CloseIcon, LogOutIcon,
} from './Icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';
import ProjectModal from './ProjectModal';

export default function NavRail({ open, onClose, counts }) {
  const { projects } = useData();
  const { user, signOut } = useAuth();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <>
      {open && <div className="nav-scrim" onClick={onClose} />}
      <nav className={`nav-rail ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="nav-rail-brand">
          <span className="nav-rail-brand-mark"><BeaconMark className="icon" style={{ color: '#161d21', width: 16, height: 16 }} /></span>
          <span className="nav-rail-brand-name">Beacon</span>
          <button type="button" className="icon-btn nav-rail-close" style={{ color: '#fff' }} onClick={onClose} aria-label="Close menu">
            <CloseIcon className="icon" />
          </button>
        </div>

        <NavLink to="/today" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <TodayIcon className="nav-link-icon" />
          Today
          {counts.today > 0 && <span className="nav-link-count">{counts.today}</span>}
        </NavLink>
        <NavLink to="/upcoming" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <UpcomingIcon className="nav-link-icon" />
          Upcoming
          {counts.upcoming > 0 && <span className="nav-link-count">{counts.upcoming}</span>}
        </NavLink>
        <NavLink to="/inbox" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <InboxIcon className="nav-link-icon" />
          Inbox
          {counts.inbox > 0 && <span className="nav-link-count">{counts.inbox}</span>}
        </NavLink>
        <NavLink to="/all" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <ListIcon className="nav-link-icon" />
          All Tasks
        </NavLink>

        <div className="nav-section-label">Projects</div>
        <div className="nav-projects-list">
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-project-dot" style={{ background: p.color }} />
              {p.name}
            </NavLink>
          ))}
          <button type="button" className="nav-new-project" onClick={() => setNewProjectOpen(true)}>
            <PlusIcon className="nav-link-icon" />
            New project
          </button>
        </div>

        <div className="nav-rail-footer">
          <button type="button" className="nav-user" onClick={signOut} title="Log out">
            <span className="nav-user-avatar">{initials(displayName)}</span>
            <span className="nav-user-email">{displayName}</span>
            <LogOutIcon style={{ width: 15, height: 15, color: 'var(--rail-ink-dim)', flexShrink: 0, marginLeft: 'auto' }} />
          </button>
        </div>
      </nav>

      {newProjectOpen && <ProjectModal onClose={() => setNewProjectOpen(false)} />}
    </>
  );
}
