export interface Arrangement {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string; // Keep for backward compatibility
  imageUrls?: string[]; // New field for multiple images
  category?: string;
  subCategory?: string;
  active: boolean;
  createdAt?: any;
}

export interface CartItem {
  arrangement: Arrangement;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  gender?: 'hombre' | 'mujer';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
