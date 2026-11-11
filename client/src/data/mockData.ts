import { User, Message, VerificationStatus } from '../types';

export type { User, Message, VerificationStatus };

export const ACTIVE_USER = {
  id: '',
  name: '',
  username: '',
  age: 0,
  avatar: '',
  location: '',
  bio: '',
  interests: [] as string[],
  intent: '',
  connectionIntents: [] as string[],
  isAvailable: false,
  phoneVerified: false,
  profileVerified: false,
  verificationStatus: 'not_started' as VerificationStatus,
  profilePhotos: [] as string[],
  talkNowAvailable: false,
};

export const updateActiveUser = (partial: Partial<typeof ACTIVE_USER>) => {
  Object.assign(ACTIVE_USER, partial);
};

export const DEFAULT_USERS: User[] = [];

let currentUsersStore: User[] = [];

export const getStoredUsers = (): User[] => {
  return currentUsersStore;
};

export const saveStoredUsers = (users: User[]) => {
  currentUsersStore = [...users];
};
