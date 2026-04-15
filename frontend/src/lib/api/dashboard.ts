import { api } from '../api';
import type { ApiResponse } from '../../types/api';
import type {
  DashboardSummary,
  PassRateDetails,
  PassRateStage,
} from '../../types/dashboard';

export type DashboardPeriod = '1m' | '3m' | '6m' | 'all' | 'custom';

export const dashboardApi = {
  summary: (
    period: DashboardPeriod = '3m',
    from?: string,
    to?: string,
  ): Promise<DashboardSummary> =>
    api
      .get<ApiResponse<DashboardSummary>>('/api/dashboard/summary', {
        params: { period, from, to },
      })
      .then((r) => {
        if (!r.data.data) throw new Error('대시보드 데이터를 불러오지 못했어요.');
        return r.data.data;
      }),
  passRateDetails: (
    stage: PassRateStage,
    period: DashboardPeriod = '3m',
    from?: string,
    to?: string,
  ): Promise<PassRateDetails> =>
    api
      .get<ApiResponse<PassRateDetails>>('/api/dashboard/pass-rate-details', {
        params: { stage, period, from, to },
      })
      .then((r) => {
        if (!r.data.data) throw new Error('상세 정보를 불러오지 못했어요.');
        return r.data.data;
      }),
};
