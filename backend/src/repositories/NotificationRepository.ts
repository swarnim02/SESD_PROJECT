import { BaseRepository } from './BaseRepository';
import { NotificationRow } from '../types/domain';

class NotificationRepository extends BaseRepository<NotificationRow, NotificationRow> {
  constructor() { super('notifications'); }

  protected mapRow(row: NotificationRow | undefined): NotificationRow | null {
    return row ?? null;
  }

  create(userId: number, message: string): NotificationRow {
    const info = this.db.prepare(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`
    ).run(userId, message);
    return this.findById(Number(info.lastInsertRowid))!;
  }

  findByUser(userId: number): NotificationRow[] {
    return this.db.prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
    ).all(userId) as NotificationRow[];
  }

  markRead(id: number, userId: number): void {
    this.db.prepare(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`
    ).run(id, userId);
  }
}

export default new NotificationRepository();
