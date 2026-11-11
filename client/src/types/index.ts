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

