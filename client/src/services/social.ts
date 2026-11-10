import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';

export interface FeedPost {
  id: string;
  userId: string;
  caption?: string;
  visibility: string;
  createdAt: string;
  media: {
    id: string;
    url: string;
    publicId?: string;
    position: number;
  }[];
  user: {
    id: string;
    name: string;
    age: number;
    avatar: string;
    bio?: string;
    verificationStatus?: string;
    isVerified?: boolean;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface UserStoryGroup {
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  stories: {
    id: string;
    mediaUrl: string;
    createdAt: string;
    expiresAt: string;
    viewCount: number;
    viewedByMe: boolean;
  }[];
}

export const fetchFeed = async (limit = 20): Promise<{ posts: FeedPost[]; hasMore: boolean }> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/social/feed?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.posts) {
        return { posts: data.data.posts, hasMore: false };
      }
    }
  } catch (err) {
    console.warn('[SocialService] fetchFeed network error:', err);
  }
  return { posts: [], hasMore: false };
};

export const fetchStories = async (): Promise<UserStoryGroup[]> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/social/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[SocialService] fetchStories network error:', err);
  }
  return [];
};

export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      await fetch(`${API_BASE_URL}/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    }
  } catch (err) {
    console.warn('[SocialService] likePost error:', err);
  }
  return true;
};

export const unlikePost = async (postId: string): Promise<boolean> => {
  return likePost(postId);
};

export const createPost = async (caption: string, mediaUrl: string): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caption, mediaUrl }),
      });
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.warn('[SocialService] createPost error:', err);
  }
  return false;
};
