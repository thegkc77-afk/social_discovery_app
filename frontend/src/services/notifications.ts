// notifications.ts - Notifications Service for Notifications REST and WebSocket Events
import { api } from './api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

/**
 * Fetch paginated list of user notifications
 */
export const getUserNotifications = async (
  options?: { isRead?: boolean; page?: number; limit?: number },
): Promise<NotificationsListResponse> => {
  try {
    const params = new URLSearchParams();
    if (options?.isRead !== undefined) params.append('isRead', String(options.isRead));
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get<NotificationsListResponse>(`/notifications${query}`);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.log('[Notification Service] Error fetching notifications:', err);
  }

  return {
    notifications: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    unreadCount: 0,
  };
};

/**
 * Get unread notification count badge
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    if (res.success && res.data) {
      return res.data.unreadCount;
    }
  } catch (err) {
    console.log('[Notification Service] Error fetching unread count:', err);
  }
  return 0;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<boolean> => {
  try {
    const res = await api.patch<{ id: string; isRead: boolean }>(
      `/notifications/${notificationId}/read`,
    );
    return res.success;
  } catch (err) {
    console.log(`[Notification Service] Error marking notification ${notificationId} as read:`, err);
  }
  return false;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const res = await api.patch<{ success: boolean; updatedCount: number }>(
      '/notifications/read-all',
    );
    return res.success;
  } catch (err) {
    console.log('[Notification Service] Error marking all notifications as read:', err);
  }
  return false;
};
