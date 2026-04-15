import { api } from '../api';
import type { ApiResponse } from '../../types/api';
import type {
  JobApplyListItem,
  JobApplyDetail,
  JobApplyCreateRequest,
  JobApplyStatus,
} from '../../types/jobApply';

export type JobApplyListParams = {
  status?: JobApplyStatus;
  from?: string;
  to?: string;
  search?: string;
};

export const jobApplyApi = {
  list: (params: JobApplyListParams = {}): Promise<JobApplyListItem[]> =>
    api
      .get<ApiResponse<JobApplyListItem[]>>('/api/job-applies', { params })
      .then((r) => r.data.data ?? []),
  create: (body: JobApplyCreateRequest): Promise<number> =>
    api
      .post<ApiResponse<{ id: number }>>('/api/job-applies', body)
      .then((r) => {
        if (!r.data.data) throw new Error('지원 생성 응답이 비어 있어요.');
        return r.data.data.id;
      }),
  get: (id: number): Promise<JobApplyDetail> =>
    api
      .get<ApiResponse<JobApplyDetail>>(`/api/job-applies/${id}`)
      .then((r) => {
        if (!r.data.data) throw new Error('지원 내역을 찾을 수 없어요.');
        return r.data.data;
      }),
  update: (id: number, body: Partial<JobApplyCreateRequest>): Promise<void> =>
    api
      .patch<ApiResponse<void>>(`/api/job-applies/${id}`, body)
      .then(() => undefined),
  delete: (id: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/job-applies/${id}`)
      .then(() => undefined),
  transition: (id: number, to: JobApplyStatus): Promise<void> =>
    api
      .post<ApiResponse<void>>(`/api/job-applies/${id}/transition`, { to })
      .then(() => undefined),
};
