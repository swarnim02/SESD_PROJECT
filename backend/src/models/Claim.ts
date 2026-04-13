import { ClaimRow, ClaimStatus } from '../types/domain';

export class Claim {
  readonly id: string;
  itemId: string;
  claimerId: string;
  message: string;
  claimStatus: ClaimStatus;
  createdAt: string;
  updatedAt: string;

  constructor(row: ClaimRow) {
    this.id = row.id;
    this.itemId = row.itemId;
    this.claimerId = row.claimerId;
    this.message = row.message;
    this.claimStatus = row.claimStatus;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }

  isPending(): boolean { return this.claimStatus === 'pending'; }
  isAccepted(): boolean { return this.claimStatus === 'accepted'; }
  isRejected(): boolean { return this.claimStatus === 'rejected'; }
}
