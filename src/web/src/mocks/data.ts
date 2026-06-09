import type { User, Photo, Pair, PairInvite } from '@/types';

export const currentUser: User = {
    id: 'user-1',
    email: 'alex.johnson@email.com',
    displayName: 'Alex Johnson',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=E07A5F&color=fff',
};

export const partner: User = {
    id: 'user-2',
    email: 'jordan.smith@email.com',
    displayName: 'Jordan Smith',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jordan+Smith&background=81B29A&color=fff',
};

export const currentPair: Pair = {
    id: 'pair-1',
    user1Id: 'user-1',
    user2Id: 'user-2',
    createdAt: '2026-03-14T10:00:00Z',
};

export const photos: Photo[] = [
    {
        id: 'photo-1',
        uploaderId: 'user-1',
        uploaderName: 'Alex',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-1/400/300',
        caption: 'Sunset picnic at the lakeside — golden light dancing on the water while we shared homemade sandwiches.',
        createdAt: '2026-06-08T18:30:00Z',
    },
    {
        id: 'photo-2',
        uploaderId: 'user-2',
        uploaderName: 'Jordan',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-2/400/300',
        caption: 'Cozy morning coffee ritual — matching mugs, messy hair, and pure contentment.',
        createdAt: '2026-06-07T09:15:00Z',
    },
    {
        id: 'photo-3',
        uploaderId: 'user-1',
        uploaderName: 'Alex',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-3/400/300',
        caption: 'Adventure day! Hiking trail selfie with the mountain peak finally in sight.',
        createdAt: '2026-06-05T14:45:00Z',
    },
    {
        id: 'photo-4',
        uploaderId: 'user-2',
        uploaderName: 'Jordan',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-4/400/300',
        caption: 'Farmers market find — we couldn\'t resist the fresh sunflowers and artisan bread.',
        createdAt: '2026-06-03T11:00:00Z',
    },
    {
        id: 'photo-5',
        uploaderId: 'user-1',
        uploaderName: 'Alex',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-5/400/300',
        caption: 'Cooking together — flour everywhere but the pasta turned out perfect.',
        createdAt: '2026-06-01T19:00:00Z',
    },
    {
        id: 'photo-6',
        uploaderId: 'user-2',
        uploaderName: 'Jordan',
        pairId: 'pair-1',
        blobUrl: 'https://picsum.photos/seed/photo-6/400/300',
        caption: 'Rainy day bookstore adventure — found matching copies of our favorite novel.',
        createdAt: '2026-05-29T15:30:00Z',
    },
];

export const pendingInvite: PairInvite = {
    id: 'invite-1',
    fromUserId: 'user-1',
    toEmail: 'friend@example.com',
    status: 'pending',
    createdAt: '2026-06-01T10:00:00Z',
};
