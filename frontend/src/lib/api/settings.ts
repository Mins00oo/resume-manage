import { api } from '../api';
import type { ApiResponse } from '../../types/api';

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  deadlineNotificationsEnabled: boolean;
  interviewNotificationsEnabled: boolean;
  googleCalendarSyncEnabled: boolean;
};

export type UpdatePreferencesRequest = Partial<UserPreferences>;

export const settingsApi = {
  get: (): Promise<UserPreferences> =>
    api
      .get<ApiResponse<UserPreferences>>('/api/me/preferences')
      .then((r) => r.data.data as UserPreferences),

  update: (patch: UpdatePreferencesRequest): Promise<UserPreferences> =>
    api
      .patch<ApiResponse<UserPreferences>>('/api/me/preferences', patch)
      .then((r) => r.data.data as UserPreferences),

  deleteAccount: (): Promise<void> =>
    api.delete<ApiResponse<void>>('/api/me').then(() => undefined),
};
