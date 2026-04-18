import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="brand-logo" style={{ width: 36, height: 36, fontSize: 16 }}>LF</span>
          <div>
            <h1>Welcome back</h1>
            <div className="sub">Sign in to continue to Lost &amp; Found.</div>
          </div>
        </div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" />
          </div>
          <button className="btn block" disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
