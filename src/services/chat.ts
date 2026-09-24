import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';
import { getStoredUsers } from '../data/mockData';

export interface ChatConversation {
  id: string;
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
    let backendConversations: ChatConversation[] = [];
    if (token) {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        backendConversations = data.data;
      }
    }

    // Merge with stored local users (Tanya, Tannu, Sanya, etc.) that have active messages
    const stored = getStoredUsers();
    const localConversations: ChatConversation[] = stored
      .filter((u) => u.messages && u.messages.length > 0)
      .map((u) => {
        const lastMsg = u.messages[u.messages.length - 1];
        return {
          id: u.id,
          otherUser: {
            id: u.id,
            name: u.name,
            avatar: u.avatar,
          },
          lastMessage: lastMsg ? lastMsg.text : 'Connected via Talk Now',
          lastMessageTime: lastMsg ? lastMsg.time : 'Just now',
          updatedAt: new Date().toISOString(),
        };
      });

    // Combine backend and local, avoiding duplicates
    const combinedMap = new Map<string, ChatConversation>();
    localConversations.forEach((item) => combinedMap.set(item.id, item));
    backendConversations.forEach((item) => combinedMap.set(item.id, item));

    return Array.from(combinedMap.values());
  } catch (error) {
    console.error('[ChatService] fetchConversations error:', error);
    const stored = getStoredUsers();
    return stored
      .filter((u) => u.messages && u.messages.length > 0)
      .map((u) => {
        const lastMsg = u.messages[u.messages.length - 1];
        return {
          id: u.id,
          otherUser: {
            id: u.id,
            name: u.name,
            avatar: u.avatar,
          },
          lastMessage: lastMsg ? lastMsg.text : 'Connected via Talk Now',
          lastMessageTime: lastMsg ? lastMsg.time : 'Just now',
          updatedAt: new Date().toISOString(),
        };
      });
  }
};

export const fetchConversationMessages = async (matchId: string, page = 1, limit = 30) => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/messages?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.success) {
      return { messages: data.data || [] };
    }
    return { messages: [] };
  } catch (error) {
    console.error('[ChatService] fetchConversationMessages error:', error);
    return { messages: [] };
  }
};

export const endMatchSession = async (matchId: string) => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/end`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
        'Authorization': `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (error) {
    console.error('[ChatService] blockMatchParticipant error:', error);
    return { success: false };
  }
};
