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
  verificationStatus: 'unverified' | 'pending' | 'verified';
  intent?: string;
  isAvailable?: boolean;
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
  isAvailable: true,
  verificationStatus: 'verified' as const
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'aanya',
    name: 'Aanya',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '1.2 km away',
    location: 'Koramangala, Bangalore',
    online: true,
    vibes: ['Gaming', 'Music'],
    bio: 'Anyone up for coffee? ☕ ',
    likes: 12,
    commentsCount: 8,
    hasLiked: false,
    verificationStatus: 'verified',
    isAvailable: true,
    messages: [
      { id: '1', sender: 'them', text: "Hey! How's your day going?", time: '5:21 PM' },
      { id: '2', sender: 'me', text: 'Pretty good! Just exploring new cafes in the city ☕', time: '5:22 PM' },
      { id: '3', sender: 'them', text: "Nice! Any hidden gems you'd recommend? ✨", time: '5:23 PM' },
      { id: '4', sender: 'me', text: "There's this cozy little place in West Village, amazing vibe!", time: '5:24 PM' },
      { id: '5', sender: 'them', text: 'Sounds perfect! I love cozy places and good conversations.', time: '5:25 PM' },
      { id: '6', sender: 'me', text: 'We should check it out sometime!', time: '5:26 PM' }
    ]
  },
  {
    id: 'rohan',
    name: 'Rohan',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '1.5 km away',
    location: 'Indiranagar, Bangalore',
    online: true,
    vibes: ['Sports', 'Music'],
    bio: "Bored on a Sunday. Let's talk!",
    likes: 7,
    commentsCount: 3,
    hasLiked: false,
    verificationStatus: 'verified',
    isAvailable: true,
    messages: []
  },
  {
    id: 'neha',
    name: 'Neha',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '2.1 km away',
    location: 'HSR Layout, Bangalore',
    online: true,
    vibes: ['Gaming', 'Travel'],
    bio: 'Looking for meaningful conversations.',
    likes: 9,
    commentsCount: 3,
    hasLiked: false,
    verificationStatus: 'verified',
    isAvailable: true,
    messages: []
  },
  {
    id: 'arjun',
    name: 'Arjun',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '2.8 km away',
    location: 'Koramangala, Bangalore',
    online: true,
    vibes: ['Technology', 'Coding'],
    bio: "Let's talk about ideas that matter.",
    likes: 11,
    commentsCount: 4,
    hasLiked: false,
    verificationStatus: 'verified',
    isAvailable: false,
    messages: []
  },
  {
    id: 'priya',
    name: 'Priya',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '1.6 km away',
    location: 'Jayanagar, Bangalore',
    online: true,
    vibes: ['Movies & Shows', 'Music'],
    bio: 'Exploring the city & good vibes ☕',
    likes: 10,
    commentsCount: 2,
    hasLiked: false,
    verificationStatus: 'verified',
    isAvailable: true,
    messages: []
  },
  {
    id: 'vikram',
    name: 'Vikram',
    age: 27,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
    detailImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=800&q=80',
    distance: '2.0 km away',
    location: 'Malleswaram, Bangalore',
    online: false,
    vibes: ['Hobbies', 'Travel'],
    bio: 'Always looking for new inspiration.',
    likes: 14,
    commentsCount: 5,
    hasLiked: false,
    verificationStatus: 'unverified',
    isAvailable: false,
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
