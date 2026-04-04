import { BaseRepository } from './BaseRepository';
import { Claim } from '../models/Claim';
import { ClaimRow, ClaimStatus } from '../types/domain';

export interface ClaimWithJoins extends Claim {
  claimerName?: string;
  claimerEmail?: string;
  itemTitle?: string;
  itemType?: string;
  itemStatus?: string;
}

class ClaimRepository extends BaseRepository<ClaimRow, Claim> {
  constructor() { super('claims'); }

  protected mapRow(row: ClaimRow | undefined): Claim | null {
    return row ? new Claim(row) : null;
  }

  create({ itemId, claimerId, message }: { itemId: number; claimerId: number; message: string }): Claim {
    const info = this.db.prepare(
      `INSERT INTO claims (item_id, claimer_id, message) VALUES (?, ?, ?)`
    ).run(itemId, claimerId, message);
    return this.findById(Number(info.lastInsertRowid))!;
  }

  updateStatus(id: number, status: ClaimStatus): Claim | null {
    this.db.prepare(
      `UPDATE claims SET claim_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(status, id);
    return this.findById(id);
  }

  findByItem(itemId: number): ClaimWithJoins[] {
    const rows = this.db.prepare(
      `SELECT c.*, u.name AS claimer_name, u.email AS claimer_email
       FROM claims c JOIN users u ON c.claimer_id = u.id
       WHERE c.item_id = ? ORDER BY c.created_at DESC`
    ).all(itemId) as (ClaimRow & { claimer_name: string; claimer_email: string })[];
    return rows.map((r) => {
      const claim = new Claim(r) as ClaimWithJoins;
      claim.claimerName = r.claimer_name;
      claim.claimerEmail = r.claimer_email;
      return claim;
    });
  }

  findByClaimer(claimerId: number): ClaimWithJoins[] {
    const rows = this.db.prepare(
      `SELECT c.*, i.title AS item_title, i.type AS item_type, i.status AS item_status
       FROM claims c JOIN items i ON c.item_id = i.id
       WHERE c.claimer_id = ? ORDER BY c.created_at DESC`
    ).all(claimerId) as (ClaimRow & { item_title: string; item_type: string; item_status: string })[];
    return rows.map((r) => {
      const claim = new Claim(r) as ClaimWithJoins;
      claim.itemTitle = r.item_title;
      claim.itemType = r.item_type;
      claim.itemStatus = r.item_status;
      return claim;
    });
  }

  /** All claims on items a given owner posted — owner's inbox. */
  findForOwner(ownerId: number): ClaimWithJoins[] {
    const rows = this.db.prepare(
      `SELECT c.*, i.title AS item_title, u.name AS claimer_name, u.email AS claimer_email
       FROM claims c
       JOIN items i ON c.item_id = i.id
       JOIN users u ON c.claimer_id = u.id
       WHERE i.created_by = ? ORDER BY c.created_at DESC`
    ).all(ownerId) as (ClaimRow & { item_title: string; claimer_name: string; claimer_email: string })[];
    return rows.map((r) => {
      const claim = new Claim(r) as ClaimWithJoins;
      claim.itemTitle = r.item_title;
      claim.claimerName = r.claimer_name;
      claim.claimerEmail = r.claimer_email;
      return claim;
    });
  }

  existsForUser(itemId: number, claimerId: number): boolean {
    const row = this.db.prepare(
      `SELECT 1 AS ok FROM claims WHERE item_id = ? AND claimer_id = ?`
    ).get(itemId, claimerId) as { ok: number } | undefined;
    return Boolean(row);
  }
}

export default new ClaimRepository();
