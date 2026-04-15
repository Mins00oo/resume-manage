import { api } from '../api';
import type { ApiResponse } from '../../types/api';

export type UploadedFileResponse = {
  id: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  createdAt: string;
};

export const fileApi = {
  upload: (file: File): Promise<UploadedFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<ApiResponse<UploadedFileResponse>>('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => {
        if (!r.data.data) throw new Error('파일 업로드에 실패했어요.');
        return r.data.data;
      });
  },
  delete: (id: number): Promise<void> =>
    api.delete<ApiResponse<void>>(`/api/files/${id}`).then(() => undefined),
  downloadUrl: (id: number): string =>
    `${import.meta.env.VITE_API_BASE_URL}/api/files/${id}`,
};
