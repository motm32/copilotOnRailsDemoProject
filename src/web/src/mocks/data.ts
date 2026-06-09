import type { User, Couple, Photo } from "@/types";

export const mockUsers: Record<string, User> = {
  sarah: {
    id: "u1",
    email: "sarah@example.com",
    displayName: "Sarah",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Sarah&background=7C3AED&color=fff",
    createdAt: "2025-12-01T10:00:00Z",
  },
  mike: {
    id: "u2",
    email: "mike@example.com",
    displayName: "Mike",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Mike&background=7C3AED&color=fff",
    createdAt: "2025-12-02T14:30:00Z",
  },
};

export const mockCouple: Couple = {
  id: "c1",
  name: "Sarah & Mike",
  inviteCode: "LOVE-2026-XKCD",
  partner1: mockUsers.sarah,
  partner2: mockUsers.mike,
  createdAt: "2025-12-05T18:00:00Z",
};

export const mockPhotos: Photo[] = [
  {
    id: "p1",
    url: "https://picsum.photos/seed/sunset-beach/400/300",
    thumbnailUrl: "https://picsum.photos/seed/sunset-beach/400/300",
    caption: "Our first sunset together",
    aiCaption: "Two silhouettes walking along a golden beach at sunset",
    note: "That magical evening in Santa Monica 🌅",
    uploadedBy: mockUsers.sarah,
    coupleId: "c1",
    createdAt: "2026-01-15T19:30:00Z",
  },
  {
    id: "p2",
    url: "https://picsum.photos/seed/coffee-date/400/300",
    thumbnailUrl: "https://picsum.photos/seed/coffee-date/400/300",
    caption: "Coffee mornings",
    aiCaption: "Two lattes with heart-shaped foam art on a wooden table",
    note: "Our favorite café ritual ☕",
    uploadedBy: mockUsers.mike,
    coupleId: "c1",
    createdAt: "2026-02-03T09:15:00Z",
  },
  {
    id: "p3",
    url: "https://picsum.photos/seed/hiking-trail/400/300",
    thumbnailUrl: "https://picsum.photos/seed/hiking-trail/400/300",
    caption: "Mountain adventures",
    aiCaption: "A couple hiking a misty mountain trail surrounded by wildflowers",
    note: "Made it to the summit! 🏔️",
    uploadedBy: mockUsers.sarah,
    coupleId: "c1",
    createdAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "p4",
    url: "https://picsum.photos/seed/cooking-together/400/300",
    thumbnailUrl: "https://picsum.photos/seed/cooking-together/400/300",
    caption: "Cooking night",
    aiCaption: "Hands rolling pasta dough together in a warm kitchen",
    note: "Homemade pasta from scratch 🍝",
    uploadedBy: mockUsers.mike,
    coupleId: "c1",
    createdAt: "2026-04-02T20:45:00Z",
  },
  {
    id: "p5",
    url: "https://picsum.photos/seed/rainy-window/400/300",
    thumbnailUrl: "https://picsum.photos/seed/rainy-window/400/300",
    caption: "Rainy day in",
    aiCaption: "Raindrops on a window with fairy lights and two mugs",
    note: "The coziest Sunday 🌧️",
    uploadedBy: mockUsers.sarah,
    coupleId: "c1",
    createdAt: "2026-04-20T16:30:00Z",
  },
  {
    id: "p6",
    url: "https://picsum.photos/seed/stargazing/400/300",
    thumbnailUrl: "https://picsum.photos/seed/stargazing/400/300",
    caption: "Stargazing",
    aiCaption: "A blanket under a sky full of stars with a telescope nearby",
    note: "Found our constellation ✨",
    uploadedBy: mockUsers.mike,
    coupleId: "c1",
    createdAt: "2026-05-18T23:00:00Z",
  },
];
