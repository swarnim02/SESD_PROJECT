import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemApi } from '../api/endpoints';
import type { Category } from '../types/models';

export function ReportItemPage({ kind }: { kind: 'lost' | 'found' }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    dateLostOrFound: new Date().toISOString().slice(0, 10),
    imageUrl: '',
    rewardAmount: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { itemApi.categories().then(setCategories).catch(() => {}); }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || null,
        location: form.location,
        dateLostOrFound: form.dateLostOrFound,
        imageUrl: form.imageUrl || null,
        rewardAmount: kind === 'lost' && form.rewardAmount ? Number(form.rewardAmount) : 0
      };
      const item = kind === 'lost' ? await itemApi.createLost(payload) : await itemApi.createFound(payload);
      navigate(`/items/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setBusy(false);
    }
  }

  const isLost = kind === 'lost';

  return (
    <div className="container-narrow" style={{ margin: 0, padding: 0 }}>
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>{isLost ? 'Report a lost item' : 'Post a found item'}</h1>
          <div className="sub">
            {isLost
              ? 'Tell us what you lost — people who found it can submit claims you can review.'
              : 'Share what you found so the rightful owner can reach out.'}
          </div>
        </div>
        <span className={`pill ${isLost ? 'lost' : 'found'}`}>{kind}</span>
      </div>

      <form className="card elevated" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}

        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder={isLost ? 'e.g. Black leather wallet' : 'e.g. Silver key ring with 3 keys'} />
          <div className="hint">A short headline helps others recognize the item.</div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Distinguishing marks, contents, color, brand, condition…" />
        </div>

        <div className="row">
          <div>
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">— Select —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Library, 2nd floor" />
          </div>
          <div>
            <label>Date {isLost ? 'lost' : 'found'}</label>
            <input type="date" value={form.dateLostOrFound} onChange={(e) => setForm({ ...form, dateLostOrFound: e.target.value })} required />
          </div>
        </div>

        <div className="field">
          <label>Image URL <span className="subtle">(optional)</span></label>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          <div className="hint">A photo makes recognition much faster.</div>
        </div>

        {isLost && (
          <div className="field">
            <label>Reward amount <span className="subtle">(optional, Rs.)</span></label>
            <input type="number" min={0} value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} placeholder="0" />
            <div className="hint">You can declare or complete a reward later from the item page.</div>
          </div>
        )}

        <div className="divider" />

        <div className="row-center" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : (isLost ? 'Post lost item' : 'Post found item')}</button>
        </div>
      </form>
    </div>
  );
}
