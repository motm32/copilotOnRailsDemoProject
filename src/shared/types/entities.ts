export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  coupleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
}

export interface Photo {
  id: string;
  coupleId: string;
  uploadedBy: string;
  blobUrl: string;
  caption: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy: string | null;
  expiresAt: Date;
  createdAt: Date;
}
