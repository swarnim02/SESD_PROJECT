import { Types } from 'mongoose';
import { ItemStatus, ItemType } from '../types/domain';

export type MongoFilter = Record<string, unknown>;

/**
 * Strategy pattern for item search.
 *
 * Each strategy knows how to build a single Mongo filter fragment. The
 * ItemRepository merges whichever strategies the caller asked for, so adding a
 * new filter (e.g. radius search) means writing one class — no if/else chain
 * in the repository.
 */
export abstract class SearchStrategy {
  abstract apply(): MongoFilter;
}

export class KeywordStrategy extends SearchStrategy {
  constructor(private readonly keyword: string) { super(); }
  apply(): MongoFilter {
    const pattern = new RegExp(this.escape(this.keyword), 'i');
    return { $or: [{ title: pattern }, { description: pattern }] };
  }
  private escape(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}

export class CategoryStrategy extends SearchStrategy {
  constructor(private readonly categoryId: string) { super(); }
  apply(): MongoFilter {
    return Types.ObjectId.isValid(this.categoryId)
      ? { categoryId: new Types.ObjectId(this.categoryId) }
      : { categoryId: null };
  }
}

export class LocationStrategy extends SearchStrategy {
  constructor(private readonly location: string) { super(); }
  apply(): MongoFilter {
    return { location: new RegExp(this.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
  }
}

export class StatusStrategy extends SearchStrategy {
  constructor(private readonly status: ItemStatus) { super(); }
  apply(): MongoFilter { return { status: this.status }; }
}

export class TypeStrategy extends SearchStrategy {
  constructor(private readonly type: ItemType) { super(); }
  apply(): MongoFilter { return { type: this.type }; }
}

export class DateRangeStrategy extends SearchStrategy {
  constructor(private readonly from?: string, private readonly to?: string) { super(); }
  apply(): MongoFilter {
    const range: Record<string, string> = {};
    if (this.from) range.$gte = this.from;
    if (this.to) range.$lte = this.to;
    return { dateLostOrFound: range };
  }
}

export interface SearchQuery {
  keyword?: string;
  categoryId?: string;
  location?: string;
  status?: ItemStatus;
  type?: ItemType;
  dateFrom?: string;
  dateTo?: string;
}

/** Collects filter params from a request-style object and returns an array of strategies. */
export function buildStrategies(query: SearchQuery = {}): SearchStrategy[] {
  const out: SearchStrategy[] = [];
  if (query.keyword) out.push(new KeywordStrategy(query.keyword));
  if (query.categoryId) out.push(new CategoryStrategy(String(query.categoryId)));
  if (query.location) out.push(new LocationStrategy(query.location));
  if (query.status) out.push(new StatusStrategy(query.status));
  if (query.type) out.push(new TypeStrategy(query.type));
  if (query.dateFrom || query.dateTo) out.push(new DateRangeStrategy(query.dateFrom, query.dateTo));
  return out;
}
