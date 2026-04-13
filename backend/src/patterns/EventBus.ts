/**
 * Observer pattern — a minimal publish/subscribe bus for domain events.
 *
 * Services publish events (e.g. "claim.submitted", "claim.accepted") and
 * observers (NotificationService, future email sender, audit log) subscribe
 * without the publisher needing to know about them.
 */
export type EventHandler<T = unknown> = (payload: T) => void;

export interface DomainEvents {
  'claim.submitted': { ownerId: string; itemTitle: string; claimerName: string };
  'claim.accepted': { claimerId: string; itemTitle: string };
  'claim.rejected': { claimerId: string; itemTitle: string };
  'reward.completed': { claimerId: string; itemTitle: string; amount: number };
  'user.suspended': { userId: string };
}

class EventBus {
  private readonly listeners = new Map<string, EventHandler[]>();

  subscribe<K extends keyof DomainEvents>(event: K, handler: EventHandler<DomainEvents[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler as EventHandler);
  }

  publish<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): void {
    const handlers = this.listeners.get(event) || [];
    for (const h of handlers) {
      try { h(payload); } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[EventBus] ${event} handler failed:`, msg);
      }
    }
  }
}

export default new EventBus();
