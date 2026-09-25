export type UserRole = 'user' | 'admin' | 'others';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
}
