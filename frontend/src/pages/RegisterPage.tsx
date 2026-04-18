import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
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
            <h1>Create your account</h1>
            <div className="sub">Post lost or found items in under a minute.</div>
          </div>
        </div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Phone <span className="subtle">(optional)</span></label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required minLength={6} placeholder="At least 6 characters" />
            <div className="hint">Use something memorable — at least 6 characters.</div>
          </div>
          <button className="btn block" disabled={busy}>
            {busy ? <><span className="spinner" /> Creating account…</> : 'Create account'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
