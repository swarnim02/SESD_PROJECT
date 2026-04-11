import { useEffect, useState } from 'react';
import { adminApi } from '../api/endpoints';
import type { AdminStats, Claim, Item, User } from '../types/models';

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'users' | 'items' | 'claims'>('users');

  async function load() {
    try {
      const [s, u, i, c] = await Promise.all([adminApi.stats(), adminApi.users(), adminApi.items(), adminApi.claims()]);
      setStats(s); setUsers(u); setItems(i); setClaims(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  useEffect(() => { load(); }, []);

  async function suspend(id: number) { await adminApi.suspend(id); await load(); }
  async function reinstate(id: number) { await adminApi.reinstate(id); await load(); }
  async function delItem(id: number) {
    if (!confirm('Delete this item?')) return;
    await adminApi.deleteItem(id); await load();
  }
  async function resolve(id: number, res: 'accepted' | 'rejected') {
    await adminApi.resolveClaim(id, res); await load();
  }

  return (
    <>
      <h1>Admin Dashboard</h1>
      {error && <div className="alert error">{error}</div>}

      {stats && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div className="stat"><span className="num">{stats.users}</span><span className="label">Users</span></div>
            <div className="stat"><span className="num">{stats.items}</span><span className="label">Items</span></div>
            <div className="stat"><span className="num">{stats.openItems}</span><span className="label">Open</span></div>
            <div className="stat"><span className="num">{stats.returnedItems}</span><span className="label">Returned</span></div>
            <div className="stat"><span className="num">{stats.claims}</span><span className="label">Claims</span></div>
            <div className="stat"><span className="num">{stats.pendingClaims}</span><span className="label">Pending</span></div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn ${tab === 'users' ? '' : 'secondary'}`} onClick={() => setTab('users')}>Users</button>
          <button className={`btn ${tab === 'items' ? '' : 'secondary'}`} onClick={() => setTab('items')}>Items</button>
          <button className={`btn ${tab === 'claims' ? '' : 'secondary'}`} onClick={() => setTab('claims')}>Claims</button>
        </div>

        {tab === 'users' && (
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>State</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td>{u.isSuspended ? <span className="pill rejected">suspended</span> : <span className="pill accepted">active</span>}</td>
                  <td>
                    {u.role !== 'admin' && (u.isSuspended
                      ? <button className="btn small" onClick={() => reinstate(u.id)}>Reinstate</button>
                      : <button className="btn small danger" onClick={() => suspend(u.id)}>Suspend</button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'items' && (
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Status</th><th>Owner</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td><td>{i.title}</td>
                  <td><span className={`pill ${i.type}`}>{i.type}</span></td>
                  <td><span className={`pill ${i.status}`}>{i.status}</span></td>
                  <td>{i.createdBy}</td>
                  <td><button className="btn small danger" onClick={() => delItem(i.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'claims' && (
          <table>
            <thead><tr><th>ID</th><th>Item</th><th>Claimer</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td><td>#{c.itemId}</td><td>#{c.claimerId}</td>
                  <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                  <td>
                    {c.claimStatus === 'pending' && (
                      <>
                        <button className="btn small success" onClick={() => resolve(c.id, 'accepted')}>Force accept</button>{' '}
                        <button className="btn small danger" onClick={() => resolve(c.id, 'rejected')}>Force reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
