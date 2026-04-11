import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimApi, itemApi } from '../api/endpoints';
import type { Claim, Item } from '../types/models';
import { useAuth } from '../context/AuthContext';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [message, setMessage] = useState('');
  const [reward, setReward] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const itemId = Number(id);

  async function load() {
    try {
      const it = await itemApi.byId(itemId);
      setItem(it);
      if (user && it.createdBy === user.id) {
        const cs = await claimApi.byItem(itemId);
        setClaims(cs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [itemId, user?.id]);

  const isOwner = user && item && user.id === item.createdBy;

  async function onClaim(e: FormEvent) {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      await claimApi.submit(itemId, message);
      setNotice('Claim submitted — the owner has been notified.');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not claim');
    } finally { setBusy(false); }
  }

  async function onAccept(claimId: number) {
    await claimApi.accept(claimId); await load();
  }
  async function onReject(claimId: number) {
    await claimApi.reject(claimId); await load();
  }

  async function onDeclareReward(e: FormEvent) {
    e.preventDefault();
    await itemApi.declareReward(itemId, Number(reward));
    setReward('');
    await load();
  }

  async function onDelete() {
    if (!confirm('Delete this item?')) return;
    await itemApi.remove(itemId);
    navigate('/my-items');
  }

  if (error && !item) return <div className="alert error">{error}</div>;
  if (!item) return <p>Loading…</p>;

  return (
    <>
      <div className="card">
        <div className="meta" style={{ marginBottom: 8 }}>
          <span className={`pill ${item.type}`}>{item.type}</span>
          <span className={`pill ${item.status}`}>{item.status}</span>
          <span className={`pill ${item.rewardStatus}`}>reward: {item.rewardStatus.replace('_', ' ')}</span>
          {item.rewardAmount > 0 && <span className="pill pending">₹{item.rewardAmount}</span>}
        </div>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <div className="meta"><span>📍 {item.location}</span><span>·</span><span>{item.dateLostOrFound}</span></div>
        {item.imageUrl && <img src={item.imageUrl} alt="" style={{ maxWidth: '100%', marginTop: 12, borderRadius: 8 }} />}
      </div>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      {!isOwner && user && item.status === 'open' && (
        <div className="card">
          <h2>Submit a claim</h2>
          <form onSubmit={onClaim}>
            <textarea placeholder="Describe identifying details to prove ownership…" value={message} onChange={(e) => setMessage(e.target.value)} required />
            <div style={{ height: 12 }} />
            <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit claim'}</button>
          </form>
        </div>
      )}

      {isOwner && (
        <>
          {item.type === 'lost' && item.rewardStatus === 'not_declared' && (
            <div className="card">
              <h2>Declare a reward</h2>
              <form onSubmit={onDeclareReward}>
                <input type="number" min={1} placeholder="Amount in ₹" value={reward} onChange={(e) => setReward(e.target.value)} required />
                <div style={{ height: 12 }} />
                <button className="btn">Declare</button>
              </form>
            </div>
          )}

          <div className="card">
            <h2>Claims on this item</h2>
            {claims.length === 0 ? <p className="muted">No claims yet.</p> : (
              <table>
                <thead><tr><th>Claimer</th><th>Message</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id}>
                      <td>{c.claimerName}<br /><span className="muted">{c.claimerEmail}</span></td>
                      <td>{c.message}</td>
                      <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                      <td>
                        {c.claimStatus === 'pending' && (
                          <>
                            <button className="btn small success" onClick={() => onAccept(c.id)}>Accept</button>
                            {' '}
                            <button className="btn small danger" onClick={() => onReject(c.id)}>Reject</button>
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
            <button className="btn danger" onClick={onDelete}>Delete item</button>
          </div>
        </>
      )}
    </>
  );
}
