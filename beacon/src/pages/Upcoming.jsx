import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { isOverdue, isToday, groupLabel } from '../lib/format';
import QuickAdd from '../components/QuickAdd';
import TaskRow from '../components/TaskRow';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { UpcomingIcon } from '../components/Icons';

export default function Upcoming() {
  const { tasks, projects } = useData();
  const [editingTask, setEditingTask] = useState(null);

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

  const upcoming = tasks
    .filter((t) => t.status !== 'done' && t.due_date && !isToday(t.due_date) && !isOverdue(t.due_date, t.status))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const groups = [];
  for (const t of upcoming) {
    const label = groupLabel(t.due_date);
    let group = groups.find((g) => g.label === label);
    if (!group) { group = { label, items: [] }; groups.push(group); }
    group.items.push(t);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Upcoming</h1>
          <div className="page-header-date mono">What's scheduled ahead</div>
        </div>
      </div>

      <QuickAdd placeholder="Log a task… try “fri” or “next week”" />

      {groups.length === 0 && (
        <EmptyState
          icon={UpcomingIcon}
          title="Nothing scheduled ahead"
          message="Tasks with a future due date will show up here, grouped by day."
        />
      )}

      {groups.map((g) => (
        <div key={g.label}>
          <div className="section-heading">{g.label} <span className="section-heading-count">{g.items.length}</span></div>
          <div className="task-list" style={{ marginBottom: 22 }}>
            {g.items.map((t) => (
              <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
            ))}
          </div>
        </div>
      ))}

      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </>
  );
}
