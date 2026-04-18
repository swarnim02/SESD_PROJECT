import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import type { AdminStats, Claim, Item, User } from '../types/models';
import { Icon } from '../components/Icon';

type Tab = 'users' | 'items' | 'claims';

function shortId(id: string): string {
  if (!id) return '';
  return id.length > 8 ? id.slice(-6) : id;
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('users');

  async function load() {
    try {
      const [s, u, i, c] = await Promise.all([adminApi.stats(), adminApi.users(), adminApi.items(), adminApi.claims()]);
      setStats(s); setUsers(u); setItems(i); setClaims(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function suspend(id: string) { await adminApi.suspend(id); await load(); }
  async function reinstate(id: string) { await adminApi.reinstate(id); await load(); }
  async function delItem(id: string) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    await adminApi.deleteItem(id); await load();
  }
  async function resolve(id: string, res: 'accepted' | 'rejected') {
    await adminApi.resolveClaim(id, res); await load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>Admin dashboard</h1>
          <div className="sub">Moderate users, items, and claims across the platform.</div>
        </div>
        <span className="pill open">admin</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      {stats ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <div className="stat"><span className="num">{stats.users}</span><span className="label">Users</span></div>
          <div className="stat"><span className="num">{stats.items}</span><span className="label">Items</span></div>
          <div className="stat"><span className="num">{stats.openItems}</span><span className="label">Open</span></div>
          <div className="stat"><span className="num">{stats.returnedItems}</span><span className="label">Returned</span></div>
          <div className="stat"><span className="num">{stats.claims}</span><span className="label">Claims</span></div>
          <div className="stat"><span className="num">{stats.pendingClaims}</span><span className="label">Pending</span></div>
        </div>
      ) : loading && (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat"><div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 6 }} /><div className="skeleton" style={{ height: 10, width: '70%' }} /></div>
          ))}
        </div>
      )}

      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users ({users.length})</button>
        <button className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>Items ({items.length})</button>
        <button className={tab === 'claims' ? 'active' : ''} onClick={() => setTab('claims')}>Claims ({claims.length})</button>
      </div>

      {tab === 'users' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>State</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong><div className="subtle">#{shortId(u.id)}</div></td>
                  <td>{u.email}</td>
                  <td><span className={`pill ${u.role === 'admin' ? 'open' : 'closed'}`}>{u.role}</span></td>
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
        </div>
      )}

      {tab === 'items' && (
        items.length === 0 ? <div className="empty"><div className="icon"><Icon name="package" size={26} /></div><h3>No items</h3></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Reward</th><th></th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td><Link to={`/items/${i.id}`}><strong>{i.title}</strong></Link><div className="subtle">#{shortId(i.id)}</div></td>
                    <td><span className={`pill ${i.type}`}>{i.type}</span></td>
                    <td><span className={`pill ${i.status}`}>{i.status}</span></td>
                    <td>{i.rewardAmount > 0 ? `Rs. ${i.rewardAmount}` : <span className="subtle">—</span>}</td>
                    <td><button className="btn small danger" onClick={() => delItem(i.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'claims' && (
        claims.length === 0 ? <div className="empty"><div className="icon"><Icon name="clipboard" size={26} /></div><h3>No claims</h3></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Claim ID</th><th>Item</th><th>Claimer</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td className="subtle">#{shortId(c.id)}</td>
                    <td><Link to={`/items/${c.itemId}`}>#{shortId(c.itemId)}</Link></td>
                    <td className="subtle">#{shortId(c.claimerId)}</td>
                    <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                    <td>
                      {c.claimStatus === 'pending' && (
                        <div className="row-center">
                          <button className="btn small success" onClick={() => resolve(c.id, 'accepted')}>Force accept</button>
                          <button className="btn small danger" onClick={() => resolve(c.id, 'rejected')}>Force reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
