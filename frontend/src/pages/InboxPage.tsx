import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimApi } from '../api/endpoints';
import type { Claim, Notification } from '../types/models';
import { Icon } from '../components/Icon';

function formatTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function InboxPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'claims' | 'notifications'>('claims');

  async function load() {
    try {
      const [inbox, n] = await Promise.all([claimApi.inbox(), claimApi.notifications()]);
      setClaims(inbox);
      setNotes(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, action: 'accept' | 'reject') {
    try {
      if (action === 'accept') await claimApi.accept(id);
      else await claimApi.reject(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  const pending = claims.filter((c) => c.claimStatus === 'pending').length;
  const unread = notes.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>Inbox</h1>
          <div className="sub">Claims on your items and activity notifications.</div>
        </div>
        <div className="row-center">
          {pending > 0 && <span className="chip"><strong>{pending}</strong> pending claim{pending === 1 ? '' : 's'}</span>}
          {unread > 0 && <span className="chip"><strong>{unread}</strong> unread</span>}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button className={tab === 'claims' ? 'active' : ''} onClick={() => setTab('claims')}>Claims ({claims.length})</button>
        <button className={tab === 'notifications' ? 'active' : ''} onClick={() => setTab('notifications')}>Notifications ({notes.length})</button>
      </div>

      {tab === 'claims' && (
        loading ? <div className="card"><div className="skeleton" style={{ height: 120 }} /></div>
        : claims.length === 0 ? (
          <div className="empty">
            <div className="icon"><Icon name="mail" size={26} /></div>
            <h3>No claims yet</h3>
            <p>When someone claims one of your items, they'll show up here for review.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Claimer</th><th>Message</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/items/${c.itemId}`}><strong>{c.itemTitle}</strong></Link></td>
                    <td>{c.claimerName}<br /><span className="muted">{c.claimerEmail}</span></td>
                    <td style={{ maxWidth: 320, color: 'var(--ink-soft)' }}>{c.message}</td>
                    <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                    <td>
                      {c.claimStatus === 'pending' && (
                        <div className="row-center">
                          <button className="btn small success" onClick={() => act(c.id, 'accept')}>Accept</button>
                          <button className="btn small danger" onClick={() => act(c.id, 'reject')}>Reject</button>
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

      {tab === 'notifications' && (
        loading ? <div className="card"><div className="skeleton" style={{ height: 120 }} /></div>
        : notes.length === 0 ? (
          <div className="empty">
            <div className="icon"><Icon name="bell" size={26} /></div>
            <h3>No notifications</h3>
            <p>We'll drop a note here when there's activity on your items.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {notes.map((n, idx) => (
              <div key={n.id} style={{
                display: 'flex', gap: 12, padding: '14px 18px',
                borderBottom: idx === notes.length - 1 ? 'none' : '1px solid var(--line)',
                background: n.isRead ? 'transparent' : 'var(--primary-soft)'
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 999,
                  background: n.isRead ? 'var(--line-strong)' : 'var(--primary)',
                  marginTop: 6, flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div>{n.message}</div>
                  <div className="subtle">{formatTime(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}
