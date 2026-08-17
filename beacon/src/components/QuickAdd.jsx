import { useState } from 'react';
import { BeaconMark } from './Icons';
import { parseQuickAdd, QUICK_ADD_HINT } from '../lib/quickAdd';
import { useData } from '../context/DataContext';

export default function QuickAdd({ defaultProjectId = null, defaultDueDate = null, placeholder = 'Log a task…' }) {
  const { createTask } = useData();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    setBusy(true);
    const parsed = parseQuickAdd(text);
    const title = parsed.title || text;
    await createTask({
      title,
      due_date: parsed.due_date ?? defaultDueDate,
      priority: parsed.priority,
      project_id: defaultProjectId,
    });
    setValue('');
    setBusy(false);
  }

  return (
    <>
      <form className="quick-add" onSubmit={handleSubmit}>
        <BeaconMark className="icon quick-add-icon" />
        <input
          className="quick-add-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Add a task"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!value.trim() || busy}>
          Add
        </button>
      </form>
      <p className="quick-add-hint">{QUICK_ADD_HINT}</p>
    </>
  );
}
