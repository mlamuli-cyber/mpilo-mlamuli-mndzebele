import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import QuickAdd from '../components/QuickAdd';
import TaskRow from '../components/TaskRow';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { ListIcon } from '../components/Icons';

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function AllTasks() {
  const { tasks, projects } = useData();
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

  const filtered = tasks
    .filter((t) => (filter === 'all' ? true : filter === 'open' ? t.status !== 'done' : t.status === 'done'))
    .filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
      const ad = a.due_date || '9999-99-99';
      const bd = b.due_date || '9999-99-99';
      if (ad !== bd) return ad.localeCompare(bd);
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">All Tasks</h1>
          <div className="page-header-date mono">{tasks.length} total</div>
        </div>
      </div>

      <QuickAdd placeholder="Log a task…" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="seg-control" style={{ maxWidth: 260 }}>
          {['open', 'done', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              className={`seg-option ${filter === f ? 'active-medium' : ''}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className="input"
          style={{ maxWidth: 220 }}
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListIcon} title="No tasks match" message="Try a different filter or search term." />
      ) : (
        <div className="task-list">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} project={projectsById[t.project_id]} onEdit={setEditingTask} />
          ))}
        </div>
      )}

      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </>
  );
}
