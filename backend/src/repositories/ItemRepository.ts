import { BaseRepository } from './BaseRepository';
import { Item } from '../models/Item';
import { ItemRow, ItemStatus, RewardStatus } from '../types/domain';
import { SearchStrategy } from '../patterns/SearchStrategy';

export interface UpdateItemFields {
  title?: string;
  description?: string;
  categoryId?: number | null;
  location?: string;
  dateLostOrFound?: string;
  imageUrl?: string | null;
  status?: ItemStatus;
}

class ItemRepository extends BaseRepository<ItemRow, Item> {
  constructor() { super('items'); }

  protected mapRow(row: ItemRow | undefined): Item | null {
    return Item.fromRow(row);
  }

  create(item: Item): Item {
    const info = this.db.prepare(
      `INSERT INTO items
         (title, description, category_id, location, date_lost_or_found,
          image_url, type, reward_amount, reward_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.title,
      item.description,
      item.categoryId,
      item.location,
      item.dateLostOrFound,
      item.imageUrl,
      item.type,
      item.rewardAmount,
      item.rewardStatus,
      item.createdBy
    );
    return this.findById(Number(info.lastInsertRowid))!;
  }

  update(id: number, fields: UpdateItemFields): Item | null {
    const mapping: { col: string; value: unknown }[] = [
      { col: 'title', value: fields.title },
      { col: 'description', value: fields.description },
      { col: 'category_id', value: fields.categoryId },
      { col: 'location', value: fields.location },
      { col: 'date_lost_or_found', value: fields.dateLostOrFound },
      { col: 'image_url', value: fields.imageUrl },
      { col: 'status', value: fields.status }
    ];
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const { col, value } of mapping) {
      if (value !== undefined) { sets.push(`${col} = ?`); params.push(value); }
    }
    if (!sets.length) return this.findById(id);
    params.push(id);
    this.db.prepare(
      `UPDATE items SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(...(params as (string | number | null)[]));
    return this.findById(id);
  }

  updateStatus(id: number, status: ItemStatus): Item | null {
    this.db.prepare(
      `UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(status, id);
    return this.findById(id);
  }

  updateRewardStatus(id: number, rewardStatus: RewardStatus, rewardAmount?: number): Item | null {
    if (rewardAmount !== undefined) {
      this.db.prepare(
        `UPDATE items SET reward_status = ?, reward_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(rewardStatus, rewardAmount, id);
    } else {
      this.db.prepare(
        `UPDATE items SET reward_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(rewardStatus, id);
    }
    return this.findById(id);
  }

  findByUser(userId: number): Item[] {
    const rows = this.db.prepare(
      `SELECT * FROM items WHERE created_by = ? ORDER BY created_at DESC`
    ).all(userId) as ItemRow[];
    return rows.map((r) => this.mapRow(r)).filter((m): m is Item => m !== null);
  }

  /**
   * Composes a list of SearchStrategy objects into a single parameterized query.
   * Each strategy contributes one AND-joined clause fragment.
   */
  searchWithStrategies(strategies: SearchStrategy[] = []): Item[] {
    let sql = 'SELECT * FROM items';
    const params: (string | number)[] = [];
    if (strategies.length) {
      const parts = strategies.map((s) => {
        const frag = s.apply();
        params.push(...frag.params);
        return frag.clause;
      });
      sql += ' WHERE ' + parts.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    const rows = this.db.prepare(sql).all(...params) as ItemRow[];
    return rows.map((r) => this.mapRow(r)).filter((m): m is Item => m !== null);
  }
}

export default new ItemRepository();
