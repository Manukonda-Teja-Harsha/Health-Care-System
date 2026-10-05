import { apiRequest } from './api';

export interface NotificationItem {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await apiRequest<NotificationItem[]>('/notifications', {
      method: 'GET',
    });
    return res.data || [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<void> {
    await apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },
};
