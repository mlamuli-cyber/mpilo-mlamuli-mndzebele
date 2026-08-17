import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BeaconMark, EyeIcon, EyeOffIcon } from '../components/Icons';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/today" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error.message);
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setBusy(false);
        return;
      }
      const { data, error } = await signUp(email.trim(), password, fullName.trim());
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        setPendingConfirm(true);
      }
    }
    setBusy(false);
  }

  if (pendingConfirm) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-mark"><BeaconMark className="icon" style={{ color: '#fff', width: 20, height: 20 }} /></span>
            <div>
              <h1>Check your email</h1>
              <p className="auth-brand-tagline">Confirm your account to continue</p>
            </div>
          </div>
          <p style={{ fontSize: '0.87rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
          </p>
          <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 18 }} onClick={() => { setPendingConfirm(false); setMode('signin'); }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-beacon" aria-hidden="true">
        <div className="auth-sweep" />
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark"><BeaconMark className="icon" style={{ color: '#fff', width: 20, height: 20 }} /></span>
          <div>
            <h1>Beacon</h1>
            <p className="auth-brand-tagline">What matters, right now.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label className="field-label" htmlFor="full-name">Full name</label>
              <input id="full-name" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus />
            </div>
          )}
          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus={mode === 'signin'} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingRight: 38 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', padding: 4 }}
              >
                {showPassword ? <EyeOffIcon style={{ width: 16, height: 16 }} /> : <EyeIcon style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>New here? <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => { setMode('signin'); setError(''); }}>Sign in</button></>
          )}
        </div>

        <p className="auth-note">Your tasks are private to your account, stored securely and only visible to you.</p>
      </div>
    </div>
  );
}
