import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimApi } from '../api/endpoints';
import type { Claim, Notification } from '../types/models';

export function InboxPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [inbox, n] = await Promise.all([claimApi.inbox(), claimApi.notifications()]);
      setClaims(inbox);
      setNotes(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id: number, action: 'accept' | 'reject') {
    try {
      if (action === 'accept') await claimApi.accept(id);
      else await claimApi.reject(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <>
      <h1>Inbox</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <h2>Claims on your items</h2>
        {claims.length === 0 ? <p className="muted">No claims yet.</p> : (
          <table>
            <thead><tr><th>Item</th><th>Claimer</th><th>Message</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/items/${c.itemId}`}>{c.itemTitle}</Link></td>
                  <td>{c.claimerName}<br /><span className="muted">{c.claimerEmail}</span></td>
                  <td>{c.message}</td>
                  <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                  <td>
                    {c.claimStatus === 'pending' && (
                      <>
                        <button className="btn small success" onClick={() => act(c.id, 'accept')}>Accept</button>{' '}
                        <button className="btn small danger" onClick={() => act(c.id, 'reject')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Notifications</h2>
        {notes.length === 0 ? <p className="muted">No notifications.</p> : (
          <ul style={{ paddingLeft: 18 }}>
            {notes.map((n) => (
              <li key={n.id} style={{ marginBottom: 8 }}>
                <span>{n.message}</span>{' '}
                <span className="muted">— {n.created_at}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
