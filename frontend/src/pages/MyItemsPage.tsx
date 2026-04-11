import { useEffect, useState } from 'react';
import { itemApi } from '../api/endpoints';
import type { Item } from '../types/models';
import { ItemCard } from '../components/ItemCard';

export function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    itemApi.mine()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  return (
    <>
      <h1>My Items</h1>
      {error && <div className="alert error">{error}</div>}
      {items.length === 0 ? <p className="muted">You haven't posted any items yet.</p> : (
        <div className="grid">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      )}
    </>
  );
}
