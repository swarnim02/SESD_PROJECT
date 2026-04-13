import { CategoryRow } from '../types/domain';

export class Category {
  readonly id: string;
  name: string;
  description: string | null;
  createdAt: string;

  constructor(row: CategoryRow) {
    this.id = row.id;
    this.name = row.name;
    this.description = row.description;
    this.createdAt = row.createdAt;
  }
}
