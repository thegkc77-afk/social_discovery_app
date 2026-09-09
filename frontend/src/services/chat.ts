// chat.ts - Chat API and state management service
import { Message } from '../data/mockData';
import { api } from './api';

export interface ChatSummary {
  id: string;
  recipient: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    bio: string;
    location: string;
    vibes: string[];
  } | null;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

/**
 * Fetch all chat threads for the current user
 */
export const getUserChats = async (): Promise<ChatSummary[]> => {
  try {
    const res = await api.get<ChatSummary[]>('/chats');
    if (res.data) {
      return res.data;
    }
  } catch (err) {
    console.log('[Chat Service] Falling back to local cache for user chats');
  }
  return [];
};

/**
 * Get or create a direct chat with target user
 */
export const createOrGetChat = async (targetUserId: string): Promise<ChatSummary | null> => {
  try {
    const res = await api.post<ChatSummary>('/chats', { targetUserId });
    if (res.data) {
      return res.data;
    }
  } catch (err) {
    console.log('[Chat Service] Failed to create chat via API, fallback to local');
  }
  return null;
};

/**
 * Fetch messages for a specific chat thread
 */
export const getChatMessages = async (chatId: string, limit = 50, before?: string): Promise<Message[]> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);

    const res = await api.get<Message[]>(`/chats/${chatId}/messages?${params.toString()}`);
    if (res.data) {
      return res.data;
    }
  } catch (err) {
    console.log(`[Chat Service] Falling back to local messages for chat ${chatId}`);
  }
  return [];
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  chatId?: string
): Promise<Message> => {
  console.log(`[Chat Service] Message from ${senderId} to ${receiverId}: ${text}`);

  if (chatId) {
    try {
      const res = await api.post<Message>(`/chats/${chatId}/messages`, {
        text,
        isInvite: false,
      });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.log('[Chat Service] API message send failed, using local format');
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    id: Date.now().toString(),
    sender: 'me',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

/**
 * Save a meetup invite message
 */
export const saveMeetupInvite = async (
  senderId: string,
  receiverId: string,
  invite: { place: string; date: string; time: string; note: string },
  chatId?: string
): Promise<Message> => {
  console.log(`[Chat Service] Meetup planned by ${senderId} for ${receiverId}:`, invite);

  if (chatId) {
    try {
      const res = await api.post<Message>(`/chats/${chatId}/messages`, {
        text: `Meetup Planned: ${invite.place} on ${invite.date} at ${invite.time}`,
        isInvite: true,
        inviteDetails: {
          ...invite,
          status: 'pending',
        },
      });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.log('[Chat Service] API invite send failed, using local format');
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id: Date.now().toString(),
    sender: 'me',
    text: `Meetup Planned: ${invite.place} on ${invite.date} at ${invite.time}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isInvite: true,
    inviteDetails: {
      ...invite,
      status: 'pending',
    },
  };
};

/**
 * Mark all messages in a chat thread as read
 */
export const markChatAsRead = async (chatId: string): Promise<boolean> => {
  try {
    const res = await api.patch<{ success: boolean; readAt: string }>(`/chats/${chatId}/read`);
    return res.data?.success ?? true;
  } catch (err) {
    return false;
  }
};
