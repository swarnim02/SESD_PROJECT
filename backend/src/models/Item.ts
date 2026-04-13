import { ItemRow, ItemStatus, ItemType, RewardStatus } from '../types/domain';

/**
 * Item — base class for any lost-or-found entry. Subclassed by LostItem and
 * FoundItem so callers can use polymorphism where the "kind" of item matters
 * (status transitions, default reward behaviour).
 */
export class Item {
  readonly id: string;
  title: string;
  description: string;
  categoryId: string | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  constructor(row: Partial<ItemRow> & { type: ItemType; createdBy: string }) {
    this.id = row.id ?? '';
    this.title = row.title ?? '';
    this.description = row.description ?? '';
    this.categoryId = row.categoryId ?? null;
    this.location = row.location ?? '';
    this.dateLostOrFound = row.dateLostOrFound ?? '';
    this.imageUrl = row.imageUrl ?? null;
    this.type = row.type;
    this.status = row.status ?? 'open';
    this.rewardAmount = row.rewardAmount ?? 0;
    this.rewardStatus = row.rewardStatus ?? 'not_declared';
    this.createdBy = row.createdBy;
    this.createdAt = row.createdAt ?? '';
    this.updatedAt = row.updatedAt ?? '';
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

  static fromRow(row: ItemRow | undefined | null): Item | null {
    if (!row) return null;
    return row.type === 'lost' ? new LostItem(row) : new FoundItem(row);
  }
}

export class LostItem extends Item {
  constructor(row: Partial<ItemRow> & { createdBy: string }) {
    super({ ...row, type: 'lost' });
  }
}

export class FoundItem extends Item {
  constructor(row: Partial<ItemRow> & { createdBy: string }) {
    super({ ...row, type: 'found' });
  }
  override hasReward(): boolean { return false; }
}
