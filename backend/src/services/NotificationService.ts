import bus from '../patterns/EventBus';
import notificationRepository from '../repositories/NotificationRepository';
import { NotificationRow } from '../types/domain';

/**
 * NotificationService — subscribes to domain events and persists user-facing
 * notifications. Demonstrates the Observer pattern: other services just
 * publish an event; this one decides what to do about it.
 */
export class NotificationService {
  constructor(private readonly repo = notificationRepository) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    bus.subscribe('claim.submitted', ({ ownerId, itemTitle, claimerName }) => {
      this.repo.create(ownerId, `New claim on "${itemTitle}" from ${claimerName}.`);
    });

    bus.subscribe('claim.accepted', ({ claimerId, itemTitle }) => {
      this.repo.create(claimerId, `Your claim on "${itemTitle}" was accepted.`);
    });

    bus.subscribe('claim.rejected', ({ claimerId, itemTitle }) => {
      this.repo.create(claimerId, `Your claim on "${itemTitle}" was rejected.`);
    });

    bus.subscribe('reward.completed', ({ claimerId, itemTitle, amount }) => {
      this.repo.create(claimerId, `Reward of ₹${amount} marked completed for "${itemTitle}".`);
    });

    bus.subscribe('user.suspended', ({ userId }) => {
      this.repo.create(userId, `Your account has been suspended by an administrator.`);
    });
  }

  listForUser(userId: number): NotificationRow[] { return this.repo.findByUser(userId); }
  markRead(id: number, userId: number): void { this.repo.markRead(id, userId); }
}

export default new NotificationService();
