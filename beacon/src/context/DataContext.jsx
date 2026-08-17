import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const [projectsRes, tasksRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    ]);
    if (projectsRes.error) setError(projectsRes.error.message);
    if (tasksRes.error) setError(tasksRes.error.message);
    setProjects(projectsRes.data ?? []);
    setTasks(tasksRes.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Tasks ----

  async function createTask({ title, notes = null, due_date = null, priority = 'medium', project_id = null }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, notes, due_date, priority, project_id, user_id: user.id })
      .select()
      .single();
    if (error) { setError(error.message); return { error }; }
    setTasks((prev) => [data, ...prev]);
    return { data };
  }

  async function updateTask(id, patch) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single();
    if (error) {
      setError(error.message);
      loadAll();
      return { error };
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return { data };
  }

  async function toggleTask(task) {
    const nextStatus = task.status === 'done' ? 'open' : 'done';
    return updateTask(task.id, {
      status: nextStatus,
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
    });
  }

  async function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setError(error.message); loadAll(); return { error }; }
    return { error: null };
  }

  // ---- Projects ----

  async function createProject({ name, color }) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, user_id: user.id })
      .select()
      .single();
    if (error) { setError(error.message); return { error }; }
    setProjects((prev) => [...prev, data]);
    return { data };
  }

  async function updateProject(id, patch) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const { data, error } = await supabase.from('projects').update(patch).eq('id', id).select().single();
    if (error) { setError(error.message); loadAll(); return { error }; }
    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    return { data };
  }

  async function deleteProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.map((t) => (t.project_id === id ? { ...t, project_id: null } : t)));
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setError(error.message); loadAll(); return { error }; }
    return { error: null };
  }

  const value = {
    projects, tasks, loading, error, refetch: loadAll,
    createTask, updateTask, toggleTask, deleteTask,
    createProject, updateProject, deleteProject,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
