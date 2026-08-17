import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import QuickAdd from '../components/QuickAdd';
import TaskRow from '../components/TaskRow';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import EmptyState from '../components/EmptyState';
import { HashIcon, EditIcon } from '../components/Icons';

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function ProjectView() {
  const { id } = useParams();
  const { tasks, projects } = useData();
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(false);

  const project = projects.find((p) => p.id === id);

  const items = useMemo(() => {
    return tasks
      .filter((t) => t.project_id === id)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
        const ad = a.due_date || '9999-99-99';
        const bd = b.due_date || '9999-99-99';
        if (ad !== bd) return ad.localeCompare(bd);
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      });
  }, [tasks, id]);

  if (!project) {
    return (
      <EmptyState
        icon={HashIcon}
        title="Project not found"
        message={<>It may have been deleted. <Link to="/all" style={{ textDecoration: 'underline' }}>Back to All Tasks</Link></>}
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="project-header-dot" style={{ background: project.color }} />
          <div>
            <h1 className="page-header-title">{project.name}</h1>
            <div className="page-header-date mono">{items.length} task{items.length === 1 ? '' : 's'}</div>
          </div>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingProject(true)}>
            <EditIcon style={{ width: 14, height: 14 }} /> Edit project
          </button>
        </div>
      </div>

      <QuickAdd defaultProjectId={project.id} placeholder={`Log a task in ${project.name}…`} />

      {items.length === 0 ? (
        <EmptyState title="No tasks yet" message="Add the first task for this project above." />
      ) : (
        <div className="task-list">
          {items.map((t) => (
            <TaskRow key={t.id} task={t} project={project} onEdit={setEditingTask} showProject={false} />
          ))}
        </div>
      )}

      {editingTask && <TaskModal task={editingTask} defaultProjectId={project.id} onClose={() => setEditingTask(null)} />}
      {editingProject && <ProjectModal project={project} onClose={() => setEditingProject(false)} />}
    </>
  );
}
