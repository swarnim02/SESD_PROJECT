import { Link } from 'react-router-dom';
import type { Item } from '../types/models';
import { Icon } from './Icon';

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="thumb">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} />
          : <Icon name={item.type === 'lost' ? 'search' : 'package'} />}
        <span className={`pill ${item.type} thumb-badge`}>{item.type}</span>
        {item.rewardAmount > 0 && (
          <span className="pill reward thumb-reward">Rs. {item.rewardAmount}</span>
        )}
      </div>
      <div className="body">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <div className="foot">
          <span className="meta icon-text" style={{ minWidth: 0 }}>
            <Icon name="location" size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
          </span>
          <span className={`pill ${item.status}`}>{item.status}</span>
        </div>
        <span className="subtle icon-text"><Icon name="calendar" size={12} /> {formatDate(item.dateLostOrFound)}</span>
      </div>
    </Link>
  );
}
