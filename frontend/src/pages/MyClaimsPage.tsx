import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimApi } from '../api/endpoints';
import type { Claim } from '../types/models';
import { Icon } from '../components/Icon';

export function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimApi.mine()
      .then((list) => { setClaims(list); setLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Failed to load'); setLoading(false); });
  }, []);

  const pending = claims.filter((c) => c.claimStatus === 'pending').length;
  const accepted = claims.filter((c) => c.claimStatus === 'accepted').length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>My claims</h1>
          <div className="sub">Claims you've submitted on items others posted.</div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {!loading && claims.length > 0 && (
        <div className="stat-grid" style={{ marginBottom: 18 }}>
          <div className="stat"><span className="num">{claims.length}</span><span className="label">Total</span></div>
          <div className="stat"><span className="num">{pending}</span><span className="label">Pending</span></div>
          <div className="stat"><span className="num">{accepted}</span><span className="label">Accepted</span></div>
        </div>
      )}

      {loading ? (
        <div className="card"><div className="skeleton" style={{ height: 140 }} /></div>
      ) : claims.length === 0 ? (
        <div className="empty">
          <div className="icon"><Icon name="clipboard" size={26} /></div>
          <h3>You haven't submitted any claims</h3>
          <p>Browse items and claim anything you recognize as yours.</p>
          <div className="spacer-12" />
          <Link to="/" className="btn">Browse items</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Your message</th>
                <th>Claim status</th>
                <th>Item status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/items/${c.itemId}`}><strong>{c.itemTitle}</strong></Link></td>
                  <td style={{ maxWidth: 360, color: 'var(--ink-soft)' }}>{c.message}</td>
                  <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                  <td><span className={`pill ${c.itemStatus}`}>{c.itemStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
