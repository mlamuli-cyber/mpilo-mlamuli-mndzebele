import { BeaconMark } from './Icons';

export default function ConfigGate() {
  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-brand">
          <span className="auth-brand-mark"><BeaconMark className="icon" style={{ color: '#fff', width: 20, height: 20 }} /></span>
          <div>
            <h1>Almost there</h1>
            <p className="auth-brand-tagline">Beacon needs its Supabase keys</p>
          </div>
        </div>
        <p style={{ fontSize: '0.87rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 14 }}>
          This build is missing <code className="mono">VITE_SUPABASE_URL</code> and/or <code className="mono">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <ul style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.8, paddingLeft: 18, listStyle: 'decimal' }}>
          <li>Create a free project at supabase.com</li>
          <li>Run the SQL in <code className="mono">supabase/schema.sql</code> from this repo in the SQL Editor</li>
          <li>Copy your Project URL and anon public key from Project Settings → API</li>
          <li>Add them as <code className="mono">.env.local</code> locally, or as environment variables in your host (e.g. Netlify)</li>
        </ul>
      </div>
    </div>
  );
}
