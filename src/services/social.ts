import { DEFAULT_USERS } from '../data/mockData';

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

export interface CommentItem {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
}

const MOCK_POSTS: FeedPost[] = DEFAULT_USERS.map((user, idx) => ({
  id: `post-${user.id}`,
  userId: user.id,
  caption: `Loving the vibe today! ✨ #${user.vibes?.[0] || 'vibematch'}`,
  visibility: 'PUBLIC',
  createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
  media: [
    {
      id: `media-${user.id}`,
      url: user.detailImage || user.avatar,
      position: 1,
    },
  ],
  user: {
    id: user.id,
    name: user.name,
    age: user.age,
    avatar: user.avatar,
    bio: user.bio,
    verificationStatus: user.verificationStatus,
    isVerified: user.profileVerified,
  },
  likeCount: user.likes || 12,
  commentCount: user.commentsCount || 3,
  likedByMe: user.hasLiked || false,
}));

const MOCK_STORIES: UserStoryGroup[] = DEFAULT_USERS.map((user) => ({
  user: {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    isVerified: user.profileVerified,
  },
  stories: [
    {
      id: `story-${user.id}`,
      mediaUrl: user.detailImage || user.avatar,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      viewCount: 15,
      viewedByMe: false,
    },
  ],
}));

export const fetchFeed = async (limit = 20, cursor?: string): Promise<{ posts: FeedPost[]; nextCursor: string | null }> => {
  return { posts: MOCK_POSTS, nextCursor: null };
};

export const fetchStories = async (): Promise<UserStoryGroup[]> => {
  return MOCK_STORIES;
};

export const createPost = async (caption: string, mediaUrls: string[]): Promise<FeedPost | null> => {
  const newPost: FeedPost = {
    id: `post-${Date.now()}`,
    userId: 'me',
    caption,
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    media: mediaUrls.map((url, i) => ({ id: `m-${i}`, url, position: i + 1 })),
    user: {
      id: 'me',
      name: 'You',
      age: 24,
      avatar: DEFAULT_USERS[0].avatar,
      isVerified: true,
    },
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
  };
  return newPost;
};

export const likePost = async (postId: string): Promise<boolean> => {
  return true;
};

export const unlikePost = async (postId: string): Promise<boolean> => {
  return true;
};

export const fetchPostComments = async (postId: string): Promise<CommentItem[]> => {
  return [];
};

export const createComment = async (postId: string, content: string): Promise<CommentItem | null> => {
  return {
    id: `comment-${Date.now()}`,
    postId,
    content,
    createdAt: new Date().toISOString(),
    user: {
      id: 'me',
      name: 'You',
      avatar: DEFAULT_USERS[0].avatar,
      isVerified: true,
    },
  };
};

export const createStory = async (mediaUrl: string): Promise<boolean> => {
  return true;
};

export const recordStoryView = async (storyId: string): Promise<boolean> => {
  return true;
};
