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
  /** 파일 메타데이터(이름·크기·MIME) 조회 */
  meta: (id: number): Promise<UploadedFileResponse> =>
    api
      .get<ApiResponse<UploadedFileResponse>>(`/api/files/${id}/meta`)
      .then((r) => {
        if (!r.data.data) throw new Error('파일 정보를 찾을 수 없어요.');
        return r.data.data;
      }),
  downloadUrl: (id: number): string =>
    `${import.meta.env.VITE_API_BASE_URL}/api/files/${id}`,
  /** Fetch file as blob URL (includes JWT auth header) */
  fetchBlobUrl: async (id: number): Promise<string> => {
    const res = await api.get(`/api/files/${id}`, { responseType: 'blob' });
    return URL.createObjectURL(res.data as Blob);
  },
  /** 원본 파일명으로 파일 저장 (브라우저 다운로드) */
  downloadAs: async (id: number, filename: string): Promise<void> => {
    const res = await api.get(`/api/files/${id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
  /** 새 탭에서 파일 열기 (PDF inline 보기) */
  openInNewTab: async (id: number): Promise<void> => {
    const res = await api.get(`/api/files/${id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      // popup blocked fallback: force download
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    // 메모리 정리는 브라우저가 나중에. 강제로 revoke 하면 새 탭이 로드 전에 끊어짐.
  },
};
