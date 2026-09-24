import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';

export const joinTalkNow = async (topic: string) => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/talk-now/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        topic: topic || 'General'
      })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[TalkNowService] joinTalkNow error:', error);
    return { success: false, message: 'Network error joining Talk Now' };
  }
};

export const joinGeneralPool = async () => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/talk-now/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        topic: 'General'
      })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[TalkNowService] joinGeneralPool error:', error);
    return { success: false, message: 'Network error joining General' };
  }
};

export const cancelTalkNowSession = async () => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/talk-now/leave`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[TalkNowService] cancelTalkNowSession error:', error);
    return { success: false, message: 'Network error cancelling Talk Now' };
  }
};

export const getTalkNowStatus = async () => {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/talk-now/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[TalkNowService] getTalkNowStatus error:', error);
    return { success: false, data: null };
  }
};
