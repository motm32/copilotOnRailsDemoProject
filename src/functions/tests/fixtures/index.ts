import type { User, Couple, Photo, InviteCode } from '../../../shared/types/entities.js';

const now = new Date('2025-01-15T10:00:00Z');

export const users: User[] = [
  {
    id: 'usr-001',
    email: 'sarah@example.com',
    displayName: 'Sarah',
    passwordHash: '', // Will be set in tests that need it
    coupleId: 'cpl-001',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-002',
    email: 'mike@example.com',
    displayName: 'Mike',
    passwordHash: '',
    coupleId: 'cpl-001',
    createdAt: now,
    updatedAt: now,
  },
];

export const couples: Couple[] = [
  {
    id: 'cpl-001',
    user1Id: 'usr-001',
    user2Id: 'usr-002',
    createdAt: now,
  },
];

export const inviteCodes: InviteCode[] = [
  {
    id: 'inv-001',
    code: 'ABCD1234',
    createdBy: 'usr-001',
    usedBy: 'usr-002',
    expiresAt: new Date('2025-01-16T10:00:00Z'),
    createdAt: now,
  },
];

export const photos: Photo[] = [
  {
    id: 'pht-001',
    coupleId: 'cpl-001',
    uploadedBy: 'usr-001',
    blobUrl: 'https://fakestorage.blob.core.windows.net/photos/cpl-001/pht-001.jpeg',
    caption: 'Our first photo',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    createdAt: now,
  },
  {
    id: 'pht-002',
    coupleId: 'cpl-001',
    uploadedBy: 'usr-002',
    blobUrl: 'https://fakestorage.blob.core.windows.net/photos/cpl-001/pht-002.png',
    caption: 'Sunset together',
    mimeType: 'image/png',
    sizeBytes: 2048,
    createdAt: now,
  },
  {
    id: 'pht-003',
    coupleId: 'cpl-001',
    uploadedBy: 'usr-001',
    blobUrl: 'https://fakestorage.blob.core.windows.net/photos/cpl-001/pht-003.webp',
    caption: null,
    mimeType: 'image/webp',
    sizeBytes: 512,
    createdAt: now,
  },
];
