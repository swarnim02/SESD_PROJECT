import { LostItem, FoundItem, Item } from '../models/Item';
import { ItemPayload, ItemType } from '../types/domain';

/**
 * ItemFactory — Factory Method pattern.
 *
 * Callers ask for an item of a given kind and receive a correctly configured
 * subclass. Keeps construction rules (e.g. found items never carry a reward)
 * in one place rather than scattered across controllers.
 */
export class ItemFactory {
  static create(kind: ItemType, payload: ItemPayload): Item {
    const base = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId ?? null,
      location: payload.location,
      dateLostOrFound: payload.dateLostOrFound,
      imageUrl: payload.imageUrl ?? null,
      createdBy: payload.createdBy
    };

    if (kind === 'lost') {
      const amount = payload.rewardAmount ?? 0;
      return new LostItem({
        ...base,
        rewardAmount: amount,
        rewardStatus: amount > 0 ? 'pending' : 'not_declared'
      });
    }
    if (kind === 'found') {
      return new FoundItem({ ...base, rewardAmount: 0, rewardStatus: 'not_declared' });
    }
    throw new Error(`Unknown item kind: ${kind}`);
  }
}
