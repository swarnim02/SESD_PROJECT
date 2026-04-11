import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimApi } from '../api/endpoints';
import type { Claim } from '../types/models';

export function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    claimApi.mine()
      .then(setClaims)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  return (
    <>
      <h1>My Claims</h1>
      {error && <div className="alert error">{error}</div>}
      {claims.length === 0 ? <p className="muted">You haven't submitted any claims.</p> : (
        <div className="card">
          <table>
            <thead><tr><th>Item</th><th>Message</th><th>Claim</th><th>Item status</th></tr></thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/items/${c.itemId}`}>{c.itemTitle}</Link></td>
                  <td>{c.message}</td>
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
