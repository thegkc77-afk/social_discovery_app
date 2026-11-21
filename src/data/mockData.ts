// mockData.ts

export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  isInvite?: boolean;
  inviteDetails?: {
    place: string;
    date: string;
    time: string;
    note: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export type VerificationStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'manual_review'
  | 'expired'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  age: number;
  avatar: string;
  detailImage?: string;
  distance: string;
  location: string;
  online: boolean;
  vibes: string[];
  bio: string;
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  messages: Message[];
  verificationStatus: VerificationStatus;
  intent?: string;
  isAvailable?: boolean;
  phoneVerified?: boolean;
  profileVerified?: boolean;
  profilePhotos?: string[];
  connectionIntents?: string[];
  talkNowAvailable?: boolean;
  verified?: boolean;
}

export const ACTIVE_USER = {
  id: 'me',
  name: 'Alex Rivera',
  username: '@rivera_vibe',
  age: 24,
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
  location: 'Koramangala, Bangalore',
  bio: 'Exploring the city & good vibes ☕✨',
  interests: ['Coding', 'Music', 'Coffee', 'Travel'],
  intent: 'Chatting & Fun',
  connectionIntents: ['Chatting & Fun'] as string[],
  isAvailable: true,
  phoneVerified: false,
  profileVerified: false,
  verificationStatus: 'not_started' as VerificationStatus,
  profilePhotos: [] as string[],
  talkNowAvailable: false,
};

export const updateActiveUser = (partial: Partial<typeof ACTIVE_USER>) => {
  Object.assign(ACTIVE_USER, partial);
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'tanya',
    name: 'Tanya',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    detailImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '0.8 km away',
    location: 'Koramangala, Bangalore',
    online: true,
    vibes: ['Gaming', 'Music', 'Coffee'],
    bio: 'Gamer girl & coffee enthusiast 🎮☕ Let\'s talk!',
    likes: 18,
    commentsCount: 9,
    hasLiked: false,
    verificationStatus: 'verified',
    verified: true,
    isAvailable: true,
    messages: [
      { id: '1', sender: 'them', text: 'Hey! I see we both love gaming 🎮 What are you playing right now?', time: '10:30 AM' },
    ]
  },
  {
    id: 'tannu',
    name: 'Tannu',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
    detailImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '1.2 km away',
    location: 'Indiranagar, Bangalore',
    online: true,
    vibes: ['Gaming', 'Hobbies', 'Travel'],
    bio: 'Always down for deep chats & good vibes ✨',
    likes: 15,
    commentsCount: 6,
    hasLiked: false,
    verificationStatus: 'verified',
    verified: true,
    isAvailable: true,
    messages: [
      { id: '1', sender: 'them', text: 'Hey there! Ready to talk about our favorite vibes? ✨', time: '11:15 AM' }
    ]
  },
  {
    id: 'sanya',
    name: 'Sanya',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
    detailImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '1.5 km away',
    location: 'HSR Layout, Bangalore',
    online: true,
    vibes: ['Gaming', 'Movies & Shows', 'Music'],
    bio: 'Big gaming fan & movie buff 🎬🎮',
    likes: 21,
    commentsCount: 11,
    hasLiked: false,
    verificationStatus: 'verified',
    verified: true,
    isAvailable: true,
    messages: [
      { id: '1', sender: 'them', text: 'Hi! Watched any good movies or played new games lately? 🎮', time: '09:45 AM' }
    ]
  },
  {
    id: 'ananya',
    name: 'Ananya',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    detailImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '2.0 km away',
    location: 'Jayanagar, Bangalore',
    online: true,
    vibes: ['Gaming', 'Technology', 'Music'],
    bio: 'Exploring cool cafes and gaming partners! ☕🎮',
    likes: 14,
    commentsCount: 4,
    hasLiked: false,
    verificationStatus: 'verified',
    verified: true,
    isAvailable: true,
    messages: []
  }
];

// In-memory data persistence fallback
let currentUsersStore = [...DEFAULT_USERS];

export const getStoredUsers = (): User[] => {
  return currentUsersStore;
};

export const saveStoredUsers = (users: User[]) => {
  currentUsersStore = [...users];
};

