import { useState } from 'react';
import { CloseIcon, TrashIcon } from './Icons';
import { PRIORITIES, PRIORITY_LABEL } from '../lib/format';
import { useData } from '../context/DataContext';

export default function TaskModal({ task, defaultProjectId = null, onClose }) {
  const { projects, createTask, updateTask, deleteTask } = useData();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'medium');
  const [projectId, setProjectId] = useState(task?.project_id ?? defaultProjectId ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      due_date: dueDate || null,
      priority,
      project_id: projectId || null,
    };
    if (isEdit) {
      await updateTask(task.id, payload);
    } else {
      await createTask(payload);
    }
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      deleteTask(task.id);
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit task' : 'New task'}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon className="icon" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label" htmlFor="task-title">Title</label>
              <input
                id="task-title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="task-notes">Notes</label>
              <textarea
                id="task-notes"
                className="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra detail…"
              />
            </div>

            <div className="modal-row">
              <div className="field">
                <label className="field-label" htmlFor="task-due">Due date</label>
                <input
                  id="task-due"
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="task-project">Project</label>
                <select
                  id="task-project"
                  className="select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <span className="field-label">Priority</span>
              <div className="seg-control">
                {PRIORITIES.map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={`seg-option ${priority === p ? `active-${p}` : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
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
              <button type="submit" className="btn btn-primary" disabled={!title.trim() || saving}>
                {isEdit ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
