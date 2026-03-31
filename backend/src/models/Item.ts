import { ItemRow, ItemStatus, ItemType, RewardStatus } from '../types/domain';

/**
 * Item — base class for any lost-or-found entry. Subclassed by LostItem and
 * FoundItem so callers can use polymorphism where the "kind" of item matters
 * (status transitions, default reward behaviour).
 */
export class Item {
  readonly id: number;
  title: string;
  description: string;
  categoryId: number | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  constructor(row: Partial<ItemRow> & { type: ItemType; created_by: number }) {
    this.id = row.id ?? 0;
    this.title = row.title ?? '';
    this.description = row.description ?? '';
    this.categoryId = row.category_id ?? null;
    this.location = row.location ?? '';
    this.dateLostOrFound = row.date_lost_or_found ?? '';
    this.imageUrl = row.image_url ?? null;
    this.type = row.type;
    this.status = row.status ?? 'open';
    this.rewardAmount = row.reward_amount ?? 0;
    this.rewardStatus = row.reward_status ?? 'not_declared';
    this.createdBy = row.created_by;
    this.createdAt = row.created_at ?? '';
    this.updatedAt = row.updated_at ?? '';
  }

  isOpen(): boolean { return this.status === 'open'; }
  isReturned(): boolean { return this.status === 'returned'; }
  hasReward(): boolean { return this.rewardAmount > 0; }

  /** Returns the set of status values this item is allowed to transition into. */
  allowedNextStatuses(): ItemStatus[] {
    switch (this.status) {
      case 'open': return ['claimed', 'closed'];
      case 'claimed': return ['returned', 'open'];
      case 'returned': return ['closed'];
      default: return [];
    }
  }

  static fromRow(row: ItemRow | undefined): Item | null {
    if (!row) return null;
    return row.type === 'lost' ? new LostItem(row) : new FoundItem(row);
  }
}

export class LostItem extends Item {
  constructor(row: Partial<ItemRow> & { created_by: number }) {
    super({ ...row, type: 'lost' });
  }
}

export class FoundItem extends Item {
  constructor(row: Partial<ItemRow> & { created_by: number }) {
    super({ ...row, type: 'found' });
  }
  override hasReward(): boolean { return false; }
}
