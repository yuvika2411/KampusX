import { authHeaders, request } from "./auth";

export type IssueStatus = "REPORTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IssueResponse {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  affectedUsers?: number;
  categoryId?: number;
  categoryName?: string;
  locationId?: number;
  locationName?: string;
  reporterId?: number;
  reporterName?: string;
  voteCount?: number;
  commentCount?: number;
  hasVoted?: boolean;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  categoryId: number;
  locationId?: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  categoryHeadId?: number;
  categoryHeadName?: string;
  categoryHeadEmail?: string;
}

export interface AdminAnalyticsResponse {
  totalIssues: number;
  reported: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  reopened: number;
}

export interface AnalyticsGroupResponse {
  id: number;
  name: string;
  count: number;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface NotificationResponse {
  id: number;
  message: string;
  issueId?: number;
  read: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const api = {
  issues: {
    getMyIssues: (): Promise<IssueResponse[]> =>
      request<IssueResponse[]>("/api/issues/my", { headers: authHeaders() }),

    getAllIssues: (): Promise<IssueResponse[]> =>
      request<IssueResponse[]>("/api/issues", { headers: authHeaders() }),

    getCategoryHeadIssues: (): Promise<IssueResponse[]> =>
      request<IssueResponse[]>("/api/issues/category-head", { headers: authHeaders() }),

    getAssignedIssues: (): Promise<IssueResponse[]> =>
      request<IssueResponse[]>("/api/issues/assigned", { headers: authHeaders() }),

    getIssueById: (id: number): Promise<IssueResponse> =>
      request<IssueResponse>(`/api/issues/${id}`, { headers: authHeaders() }),

    createIssue: (data: CreateIssuePayload): Promise<IssueResponse> =>
      request<IssueResponse>("/api/issues", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),

    updateStatus: (issueId: number, status: IssueStatus): Promise<IssueResponse> =>
      request<IssueResponse>(`/api/issues/${issueId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      }),

    closeIssue: (issueId: number): Promise<IssueResponse> =>
      request<IssueResponse>(`/api/issues/${issueId}/close`, {
        method: "PUT",
        headers: authHeaders(),
      }),

    reopenIssue: (issueId: number): Promise<IssueResponse> =>
      request<IssueResponse>(`/api/issues/${issueId}/reopen`, {
        method: "PUT",
        headers: authHeaders(),
      }),

    assignResolver: (issueId: number, resolverId: number): Promise<IssueResponse> =>
      request<IssueResponse>(`/api/issues/${issueId}/resolver/${resolverId}`, {
        method: "PUT",
        headers: authHeaders(),
      }),

    vote: (issueId: number): Promise<string> =>
      request<string>(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: authHeaders(),
      }),

    deleteIssue: (issueId: number): Promise<void> =>
      request<void>(`/api/issues/${issueId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
  },

  categories: {
    getAll: (): Promise<CategoryResponse[]> =>
      request<CategoryResponse[]>("/api/categories", { headers: authHeaders() }),

    assignHead: (categoryId: number, userId: number): Promise<CategoryResponse> =>
      request<CategoryResponse>(`/api/categories/${categoryId}/head/${userId}`, {
        method: "PUT",
        headers: authHeaders(),
      }),
  },

  admin: {
    getAnalytics: (): Promise<AdminAnalyticsResponse> =>
      request<AdminAnalyticsResponse>("/api/admin/analytics", { headers: authHeaders() }),

    getCategoryAnalytics: (): Promise<AnalyticsGroupResponse[]> =>
      request<AnalyticsGroupResponse[]>("/api/admin/analytics/categories", { headers: authHeaders() }),

    getLocationAnalytics: (): Promise<AnalyticsGroupResponse[]> =>
      request<AnalyticsGroupResponse[]>("/api/admin/analytics/locations", { headers: authHeaders() }),

    getUsers: (): Promise<AdminUserResponse[]> =>
      request<AdminUserResponse[]>("/api/admin/users", { headers: authHeaders() }),

    updateRole: (userId: number, role: string): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ role }),
      }),

    deactivate: (userId: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/admin/users/${userId}/deactivate`, {
        method: "PUT",
        headers: authHeaders(),
      }),

    reactivate: (userId: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/admin/users/${userId}/reactivate`, {
        method: "PUT",
        headers: authHeaders(),
      }),
  },

  notifications: {
    getMyNotifications: (page = 0, size = 10): Promise<PageResponse<NotificationResponse>> =>
      request<PageResponse<NotificationResponse>>(`/api/notifications?page=${page}&size=${size}`, {
        headers: authHeaders(),
      }),

    getUnreadCount: (): Promise<{ unreadCount: number }> =>
      request<{ unreadCount: number }>("/api/notifications/unread-count", {
        headers: authHeaders(),
      }),

    markAsRead: (id: number): Promise<NotificationResponse> =>
      request<NotificationResponse>(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders(),
      }),
  },
};
