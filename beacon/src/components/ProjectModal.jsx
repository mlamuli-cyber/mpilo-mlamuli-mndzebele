import { useState } from 'react';
import { CloseIcon, TrashIcon } from './Icons';
import { useData } from '../context/DataContext';

export const PROJECT_COLORS = [
  '#2c5f8a', '#3b7a57', '#d9820f', '#c4432b',
  '#5b4d8a', '#4b5a5e', '#0f6e6a', '#8a4d6a',
];

export default function ProjectModal({ project, onClose }) {
  const { createProject, updateProject, deleteProject, tasks } = useData();
  const isEdit = Boolean(project);

  const [name, setName] = useState(project?.name ?? '');
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    if (isEdit) {
      await updateProject(project.id, { name: name.trim(), color });
    } else {
      await createProject({ name: name.trim(), color });
    }
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    const count = tasks.filter((t) => t.project_id === project.id).length;
    const warn = count > 0
      ? `Delete "${project.name}"? Its ${count} task${count === 1 ? '' : 's'} will move to No Project.`
      : `Delete "${project.name}"?`;
    if (window.confirm(warn)) {
      deleteProject(project.id);
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: 380 }} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit project' : 'New project'}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit project' : 'New project'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon className="icon" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label" htmlFor="project-name">Name</label>
              <input
                id="project-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="field">
              <span className="field-label">Color</span>
              <div className="swatch-picker">
                {PROJECT_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`swatch ${color === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Choose color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {isEdit ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                <TrashIcon style={{ width: 14, height: 14 }} /> Delete
              </button>
            ) : <span />}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!name.trim() || saving}>
                {isEdit ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
