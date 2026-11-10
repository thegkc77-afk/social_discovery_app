import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';

export interface ChatConversation {
  id: string;
  matchId?: string;
  otherUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: string | { content?: string; createdAt?: string };
  lastMessageTime?: string;
  unreadCount?: number;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchConversations = async (): Promise<ChatConversation[]> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (error) {
    console.error('[ChatService] fetchConversations error:', error);
  }
  return [];
};

export const fetchConversationMessages = async (matchId: string, page = 1, limit = 50) => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/messages?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        return { messages: data.data || [] };
      }
    }
  } catch (error) {
    console.error('[ChatService] fetchConversationMessages error:', error);
  }
  return { messages: [] };
};

export const endMatchSession = async (matchId: string) => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/end`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('[ChatService] endMatchSession error:', error);
    return { success: false };
  }
};

export const blockMatchParticipant = async (matchId: string) => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/block`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('[ChatService] blockMatchParticipant error:', error);
    return { success: false };
  }
};

export interface MeetupInviteDetails {
  place: string;
  date: string;
  time: string;
  note?: string;
}

export const saveMeetupInvite = async (matchId: string, recipientId: string, invite: MeetupInviteDetails) => {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false };
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientId, ...invite }),
    });
    return await res.json();
  } catch (error) {
    console.error('[ChatService] saveMeetupInvite error:', error);
    return { success: false };
  }
};
