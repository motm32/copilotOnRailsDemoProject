export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Couple {
  id: string;
  name: string;
  inviteCode: string;
  partner1: User;
  partner2: User | null;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  aiCaption: string;
  note: string;
  uploadedBy: User;
  coupleId: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
