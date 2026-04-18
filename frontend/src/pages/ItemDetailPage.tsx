import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { claimApi, itemApi } from '../api/endpoints';
import type { Claim, Item } from '../types/models';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

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

  const itemId = id ?? '';

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

  async function onAccept(claimId: string) {
    await claimApi.accept(claimId); await load();
  }
  async function onReject(claimId: string) {
    await claimApi.reject(claimId); await load();
  }

  async function onDeclareReward(e: FormEvent) {
    e.preventDefault();
    await itemApi.declareReward(itemId, Number(reward));
    setReward('');
    await load();
  }

  async function onCompleteReward() {
    if (!confirm('Mark the reward as paid?')) return;
    await itemApi.completeReward(itemId);
    await load();
  }

  async function onDelete() {
    if (!confirm('Delete this item?')) return;
    await itemApi.remove(itemId);
    navigate('/my-items');
  }

  if (error && !item) return <div className="alert error">{error}</div>;
  if (!item) {
    return (
      <div className="detail-grid">
        <div>
          <div className="skeleton" style={{ aspectRatio: '16/10', borderRadius: 12, marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: '80%' }} />
        </div>
        <div className="card"><div className="skeleton" style={{ height: 120 }} /></div>
      </div>
    );
  }

  return (
    <>
      <p className="muted" style={{ marginBottom: 10 }}>
        <Link to="/" className="icon-text"><Icon name="arrowLeft" size={14} /> Back to browse</Link>
      </p>

      <div className="detail-grid">
        <div>
          <div className="detail-media">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <Icon name={item.type === 'lost' ? 'search' : 'package'} />}
          </div>

          <div className="meta" style={{ marginBottom: 10 }}>
            <span className={`pill ${item.type}`}>{item.type}</span>
            <span className={`pill ${item.status}`}>{item.status}</span>
            <span className={`pill ${item.rewardStatus}`}>reward: {item.rewardStatus.replace('_', ' ')}</span>
            {item.rewardAmount > 0 && <span className="pill reward">Rs. {item.rewardAmount}</span>}
          </div>

          <h1>{item.title}</h1>
          <p style={{ color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{item.description}</p>

          <div className="divider" />

          <div className="row-2" style={{ maxWidth: 520 }}>
            <div>
              <div className="subtle icon-text"><Icon name="location" size={12} /> Location</div>
              <div>{item.location}</div>
            </div>
            <div>
              <div className="subtle icon-text"><Icon name="calendar" size={12} /> Date {item.type === 'lost' ? 'lost' : 'found'}</div>
              <div>{formatDate(item.dateLostOrFound)}</div>
            </div>
          </div>
        </div>

        <aside>
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}

          {!user && (
            <div className="card">
              <h2>Want to claim this?</h2>
              <p className="muted">Sign in to submit a claim to the owner.</p>
              <Link to="/login" className="btn block">Sign in</Link>
            </div>
          )}

          {!isOwner && user && item.status === 'open' && (
            <div className="card">
              <h2>Submit a claim</h2>
              <p className="muted" style={{ marginBottom: 10 }}>Share details only the real owner would know.</p>
              <form onSubmit={onClaim}>
                <textarea placeholder="Describe identifying details to prove ownership…" value={message} onChange={(e) => setMessage(e.target.value)} required />
                <div className="spacer-12" />
                <button className="btn block" disabled={busy}>{busy ? <><span className="spinner" /> Submitting…</> : 'Submit claim'}</button>
              </form>
            </div>
          )}

          {!isOwner && user && item.status !== 'open' && (
            <div className="card">
              <h2>Claims closed</h2>
              <p className="muted">This item is no longer accepting new claims.</p>
            </div>
          )}

          {isOwner && (
            <>
              <div className="card">
                <h2>Owner tools</h2>
                {item.type === 'lost' && item.rewardStatus === 'not_declared' && (
                  <form onSubmit={onDeclareReward}>
                    <label>Declare a reward</label>
                    <input type="number" min={1} placeholder="Amount in Rs." value={reward} onChange={(e) => setReward(e.target.value)} required />
                    <div className="spacer-12" />
                    <button className="btn block">Declare reward</button>
                  </form>
                )}
                {item.type === 'lost' && item.rewardStatus === 'pending' && (
                  <button className="btn success block" onClick={onCompleteReward}>Mark reward as paid</button>
                )}
                {item.rewardStatus === 'completed' && (
                  <div className="alert success">Reward already settled.</div>
                )}
                <div className="spacer-12" />
                <button className="btn danger block" onClick={onDelete}>Delete item</button>
              </div>
            </>
          )}
        </aside>
      </div>

      {isOwner && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="page-head">
            <h2 style={{ marginBottom: 0 }}>Claims on this item</h2>
            <span className="chip">{claims.length} claim{claims.length === 1 ? '' : 's'}</span>
          </div>
          {claims.length === 0 ? (
            <div className="empty" style={{ padding: '24px 16px' }}>
              <div className="icon"><Icon name="mail" size={26} /></div>
              <h3>No claims yet</h3>
              <p>When someone submits a claim, you'll see it here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Claimer</th><th>Message</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id}>
                      <td>{c.claimerName}<br /><span className="muted">{c.claimerEmail}</span></td>
                      <td style={{ maxWidth: 360 }}>{c.message}</td>
                      <td><span className={`pill ${c.claimStatus}`}>{c.claimStatus}</span></td>
                      <td>
                        {c.claimStatus === 'pending' && (
                          <div className="row-center">
                            <button className="btn small success" onClick={() => onAccept(c.id)}>Accept</button>
                            <button className="btn small danger" onClick={() => onReject(c.id)}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
