import { ItemStatus, ItemType } from '../types/domain';

export interface SearchFragment {
  clause: string;
  params: (string | number)[];
}

/**
 * Strategy pattern for item search.
 *
 * Each strategy knows how to build a WHERE-clause fragment and its parameter
 * bindings. The ItemRepository composes whichever strategies the caller asked
 * for, so adding a new filter (e.g. radius search) means writing one class —
 * no if/else chain in the repository.
 */
export abstract class SearchStrategy {
  abstract apply(): SearchFragment;
}

export class KeywordStrategy extends SearchStrategy {
  constructor(private readonly keyword: string) { super(); }
  apply(): SearchFragment {
    const like = `%${this.keyword}%`;
    return { clause: '(title LIKE ? OR description LIKE ?)', params: [like, like] };
  }
}

export class CategoryStrategy extends SearchStrategy {
  constructor(private readonly categoryId: number) { super(); }
  apply(): SearchFragment {
    return { clause: 'category_id = ?', params: [this.categoryId] };
  }
}

export class LocationStrategy extends SearchStrategy {
  constructor(private readonly location: string) { super(); }
  apply(): SearchFragment {
    return { clause: 'location LIKE ?', params: [`%${this.location}%`] };
  }
}

export class StatusStrategy extends SearchStrategy {
  constructor(private readonly status: ItemStatus) { super(); }
  apply(): SearchFragment {
    return { clause: 'status = ?', params: [this.status] };
  }
}

export class TypeStrategy extends SearchStrategy {
  constructor(private readonly type: ItemType) { super(); }
  apply(): SearchFragment {
    return { clause: 'type = ?', params: [this.type] };
  }
}

export class DateRangeStrategy extends SearchStrategy {
  constructor(private readonly from?: string, private readonly to?: string) { super(); }
  apply(): SearchFragment {
    if (this.from && this.to) return { clause: 'date_lost_or_found BETWEEN ? AND ?', params: [this.from, this.to] };
    if (this.from) return { clause: 'date_lost_or_found >= ?', params: [this.from] };
    return { clause: 'date_lost_or_found <= ?', params: [this.to!] };
  }
}

export interface SearchQuery {
  keyword?: string;
  categoryId?: number | string;
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
  if (query.categoryId) out.push(new CategoryStrategy(Number(query.categoryId)));
  if (query.location) out.push(new LocationStrategy(query.location));
  if (query.status) out.push(new StatusStrategy(query.status));
  if (query.type) out.push(new TypeStrategy(query.type));
  if (query.dateFrom || query.dateTo) out.push(new DateRangeStrategy(query.dateFrom, query.dateTo));
  return out;
}
