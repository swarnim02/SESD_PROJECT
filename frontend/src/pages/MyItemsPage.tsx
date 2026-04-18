import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemApi } from '../api/endpoints';
import type { Item } from '../types/models';
import { ItemCard } from '../components/ItemCard';
import { Icon } from '../components/Icon';

type Tab = 'all' | 'lost' | 'found';

export function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    itemApi.mine()
      .then((list) => { setItems(list); setLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Failed to load'); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'all') return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  const counts = useMemo(() => ({
    all: items.length,
    lost: items.filter((i) => i.type === 'lost').length,
    found: items.filter((i) => i.type === 'found').length
  }), [items]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>My items</h1>
          <div className="sub">Items you've posted on Lost &amp; Found.</div>
        </div>
        <div className="row-center">
          <Link to="/report-lost" className="btn secondary"><Icon name="plus" size={14} /> Report lost</Link>
          <Link to="/report-found" className="btn"><Icon name="plus" size={14} /> Post found</Link>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All ({counts.all})</button>
        <button className={tab === 'lost' ? 'active' : ''} onClick={() => setTab('lost')}>Lost ({counts.lost})</button>
        <button className={tab === 'found' ? 'active' : ''} onClick={() => setTab('found')}>Found ({counts.found})</button>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="item-card"><div className="thumb skeleton" /><div className="body"><div className="skeleton" style={{ height: 16, marginBottom: 8 }} /><div className="skeleton" style={{ height: 12 }} /></div></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="icon"><Icon name="package" size={26} /></div>
          <h3>{items.length === 0 ? "You haven't posted any items yet" : 'No items match this filter'}</h3>
          <p>Report something you lost or post an item you found to help reunite it with its owner.</p>
          <div className="spacer-12" />
          <Link to="/report-lost" className="btn">Report a lost item</Link>
        </div>
      ) : (
        <div className="grid">{filtered.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      )}
    </>
  );
}
