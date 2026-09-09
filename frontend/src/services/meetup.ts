// meetup.ts - Meetup Service for interacting with Meetup REST & State Machine APIs
import { api } from './api';

export type MeetupStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
export type MeetupAction = 'accept' | 'decline' | 'cancel' | 'complete';

export interface MeetupParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface MeetupResponse {
  id: string;
  chatId?: string;
  place: string;
  date: string;
  time: string;
  note?: string;
  status: MeetupStatus;
  isCreator: boolean;
  creator: MeetupParticipant;
  recipient: MeetupParticipant;
  partner: MeetupParticipant;
  allowedActions: MeetupAction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetupPayload {
  recipientId: string;
  place: string;
  date: string;
  time: string;
  note?: string;
  chatId?: string;
}

export interface MeetupStatusResponse {
  meetupId: string;
  status: MeetupStatus;
  allowedActions: MeetupAction[];
  isCreator: boolean;
  isRecipient: boolean;
  updatedAt: string;
  createdAt: string;
}

/**
 * Create and send a new meetup invitation (PENDING state)
 */
export const createMeetupInvitation = async (
  payload: CreateMeetupPayload,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.post<MeetupResponse>('/meetups', payload);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log('[Meetup Service] Error creating meetup via API:', err);
  }
  return null;
};

/**
 * Fetch all meetups for the current user
 */
export const getMeetups = async (
  filter?: { status?: MeetupStatus; type?: 'created' | 'received' | 'all' },
): Promise<MeetupResponse[]> => {
  try {
    const query = new URLSearchParams();
    if (filter?.status) query.append('status', filter.status);
    if (filter?.type) query.append('type', filter.type);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<MeetupResponse[]>(`/meetups${queryString}`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log('[Meetup Service] Error fetching meetups:', err);
  }
  return [];
};

/**
 * Get meetup details by ID
 */
export const getMeetupById = async (
  meetupId: string,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.get<MeetupResponse>(`/meetups/${meetupId}`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error fetching meetup ${meetupId}:`, err);
  }
  return null;
};

/**
 * Accept a meetup invitation (PENDING -> ACCEPTED)
 */
export const acceptMeetupInvitation = async (
  meetupId: string,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.patch<MeetupResponse>(`/meetups/${meetupId}/accept`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error accepting meetup ${meetupId}:`, err);
  }
  return null;
};

/**
 * Decline a meetup invitation (PENDING -> DECLINED)
 */
export const declineMeetupInvitation = async (
  meetupId: string,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.patch<MeetupResponse>(`/meetups/${meetupId}/decline`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error declining meetup ${meetupId}:`, err);
  }
  return null;
};

/**
 * Cancel a meetup invitation (PENDING / ACCEPTED -> CANCELLED)
 */
export const cancelMeetupInvitation = async (
  meetupId: string,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.patch<MeetupResponse>(`/meetups/${meetupId}/cancel`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error cancelling meetup ${meetupId}:`, err);
  }
  return null;
};

/**
 * Mark a meetup as completed (ACCEPTED -> COMPLETED)
 */
export const completeMeetup = async (
  meetupId: string,
): Promise<MeetupResponse | null> => {
  try {
    const res = await api.patch<MeetupResponse>(`/meetups/${meetupId}/complete`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error completing meetup ${meetupId}:`, err);
  }
  return null;
};

/**
 * Get current meetup state and allowed action verbs
 */
export const getMeetupStatus = async (
  meetupId: string,
): Promise<MeetupStatusResponse | null> => {
  try {
    const res = await api.get<MeetupStatusResponse>(`/meetups/${meetupId}/status`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Meetup Service] Error getting status for meetup ${meetupId}:`, err);
  }
  return null;
};
