import itemRepository, { UpdateItemFields } from '../repositories/ItemRepository';
import { ItemFactory } from '../patterns/ItemFactory';
import { buildStrategies, SearchQuery } from '../patterns/SearchStrategy';
import { ApiError } from '../utils/ApiError';
import { requireFields } from '../utils/validators';
import { Item } from '../models/Item';
import { ItemPayload } from '../types/domain';

/**
 * ItemService — business rules around lost and found items.
 *
 * Controllers hand it request-shaped input; this layer is responsible for
 * enforcing invariants (status transitions, ownership checks, reward logic)
 * before persistence.
 */
export class ItemService {
  constructor(private readonly repo = itemRepository) {}

  createLost(userId: number, payload: Omit<ItemPayload, 'createdBy'>): Item {
    requireFields(payload, ['title', 'description', 'location', 'dateLostOrFound']);
    const item = ItemFactory.create('lost', { ...payload, createdBy: userId });
    return this.repo.create(item);
  }

  createFound(userId: number, payload: Omit<ItemPayload, 'createdBy'>): Item {
    requireFields(payload, ['title', 'description', 'location', 'dateLostOrFound']);
    const item = ItemFactory.create('found', { ...payload, createdBy: userId });
    return this.repo.create(item);
  }

  update(id: number, userId: number, payload: UpdateItemFields): Item {
    const item = this.requireOwned(id, userId);
    if (payload.status && ![...item.allowedNextStatuses(), item.status].includes(payload.status)) {
      throw ApiError.badRequest(`Illegal status transition ${item.status} → ${payload.status}`);
    }
    return this.repo.update(id, payload)!;
  }

  delete(id: number, userId: number, isAdmin = false): boolean {
    const item = this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    if (!isAdmin && item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    return this.repo.deleteById(id);
  }

  getById(id: number): Item {
    const item = this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    return item;
  }

  search(query: SearchQuery): Item[] {
    const strategies = buildStrategies(query);
    return this.repo.searchWithStrategies(strategies);
  }

  listForUser(userId: number): Item[] { return this.repo.findByUser(userId); }

  private requireOwned(id: number, userId: number): Item {
    const item = this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    return item;
  }
}

export default new ItemService();
