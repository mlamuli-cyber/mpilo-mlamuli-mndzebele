import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { isOverdue, isToday, friendlyDate, isoDateOnly } from '../lib/format';
import QuickAdd from '../components/QuickAdd';
import TaskRow from '../components/TaskRow';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { TodayIcon, ChevronDownIcon } from '../components/Icons';

export default function Today() {
  const { tasks, projects } = useData();
  const [editingTask, setEditingTask] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

  const overdue = tasks.filter((t) => t.status !== 'done' && isOverdue(t.due_date, t.status));
  const dueToday = tasks.filter((t) => t.status !== 'done' && isToday(t.due_date));
  const completedToday = tasks.filter((t) => t.status === 'done' && t.completed_at && isoDateOnly(new Date(t.completed_at)) === isoDateOnly(new Date()));

  const totalToday = overdue.length + dueToday.length + completedToday.length;
  const donePct = totalToday === 0 ? 0 : Math.round((completedToday.length / totalToday) * 100);

  const nothingActive = overdue.length === 0 && dueToday.length === 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Today</h1>
          <div className="page-header-date mono">{friendlyDate()}</div>
        </div>
        {totalToday > 0 && (
          <div className="progress-strip">
            <div className="progress-track"><div className="progress-fill" style={{ width: `${donePct}%` }} /></div>
            <span className="progress-label">{completedToday.length}/{totalToday} done</span>
          </div>
        )}
      </div>

      <QuickAdd defaultDueDate={isoDateOnly(new Date())} placeholder="Log a task for today…" />

      {overdue.length > 0 && (
        <>
          <div className="section-heading" style={{ color: 'var(--signal-red)' }}>
            Overdue <span className="section-heading-count">{overdue.length}</span>
          </div>
          <div className="task-list" style={{ marginBottom: 22 }}>
            {overdue.map((t) => (
              <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
            ))}
          </div>
        </>
      )}

      {nothingActive && completedToday.length === 0 && (
        <EmptyState
          icon={TodayIcon}
          title="Nothing due today"
          message="Log a task above, or check Upcoming for what's next."
        />
      )}

      {dueToday.length > 0 && (
        <>
          <div className="section-heading">Due today <span className="section-heading-count">{dueToday.length}</span></div>
          <div className="task-list" style={{ marginBottom: 22 }}>
            {dueToday.map((t) => (
              <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
            ))}
          </div>
        </>
      )}

      {nothingActive && completedToday.length > 0 && (
        <EmptyState
          icon={TodayIcon}
          title="All caught up"
          message="Everything due today is done. Nice work."
        />
      )}

      {completedToday.length > 0 && (
        <>
          <button
            type="button"
            className="section-heading"
            style={{ background: 'none', width: '100%', justifyContent: 'flex-start', cursor: 'pointer' }}
            onClick={() => setShowCompleted((s) => !s)}
          >
            Completed today <span className="section-heading-count">{completedToday.length}</span>
            <ChevronDownIcon style={{ width: 13, height: 13, transform: showCompleted ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
          </button>
          {showCompleted && (
            <div className="task-list">
              {completedToday.map((t) => (
                <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
              ))}
            </div>
          )}
        </>
      )}

      {(editingTask || creatingNew) && (
        <TaskModal
          task={editingTask}
          defaultProjectId={null}
          onClose={() => { setEditingTask(null); setCreatingNew(false); }}
        />
      )}
    </>
  );
}
