import { CheckIcon, TrashIcon, EditIcon, AlertIcon } from './Icons';
import { dueLabel, isOverdue, PRIORITY_LABEL } from '../lib/format';
import { useData } from '../context/DataContext';

export default function TaskRow({ task, project, onEdit, showProject = true }) {
  const { toggleTask, deleteTask } = useData();
  const done = task.status === 'done';
  const overdue = isOverdue(task.due_date, task.status);
  const signalClass = done ? 'task-signal-done' : `task-signal-${task.priority}`;
  const label = dueLabel(task.due_date);

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      deleteTask(task.id);
    }
  }

  return (
    <div className={`task-row ${done ? 'is-done' : ''}`}>
      <span className={`task-signal ${signalClass}`} aria-hidden="true" />
      <button
        type="button"
        className={`task-check ${done ? 'checked' : ''}`}
        onClick={() => toggleTask(task)}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      >
        <CheckIcon />
      </button>
      <div className="task-main" onClick={() => onEdit(task)}>
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {label && (
            <span className={`task-due ${overdue ? 'overdue' : ''}`}>
              {overdue && <AlertIcon style={{ width: 12, height: 12 }} />}
              {label}
            </span>
          )}
          {showProject && project && (
            <span className="project-pill">
              <span className="project-pill-dot" style={{ background: project.color }} />
              {project.name}
            </span>
          )}
          {!done && (
            <span className={`priority-chip priority-chip-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          )}
        </div>
      </div>
      <div className="task-row-actions">
        <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task">
          <EditIcon className="icon" style={{ width: 15, height: 15 }} />
        </button>
        <button type="button" className="icon-btn" onClick={handleDelete} aria-label="Delete task">
          <TrashIcon className="icon" style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}
