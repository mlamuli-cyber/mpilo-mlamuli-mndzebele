import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import QuickAdd from '../components/QuickAdd';
import TaskRow from '../components/TaskRow';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { InboxIcon } from '../components/Icons';

export default function Inbox() {
  const { tasks, projects } = useData();
  const [editingTask, setEditingTask] = useState(null);

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);
  const items = tasks.filter((t) => t.status !== 'done' && !t.due_date);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Inbox</h1>
          <div className="page-header-date mono">Not yet scheduled</div>
        </div>
      </div>

      <QuickAdd placeholder="Capture something without a date…" />

      {items.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Inbox is clear"
          message="Anything you log without a due date lands here until you're ready to schedule it."
        />
      ) : (
        <div className="task-list">
          {items.map((t) => (
            <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
          ))}
        </div>
      )}

      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </>
  );
}
