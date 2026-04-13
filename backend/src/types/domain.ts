export type UserRole = 'user' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned' | 'closed';
export type RewardStatus = 'not_declared' | 'pending' | 'completed';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface ItemRow {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimRow {
  id: string;
  itemId: string;
  claimerId: string;
  message: string;
  claimStatus: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ItemPayload {
  title: string;
  description: string;
  categoryId?: string | null;
  location: string;
  dateLostOrFound: string;
  imageUrl?: string | null;
  rewardAmount?: number;
  createdBy: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}
