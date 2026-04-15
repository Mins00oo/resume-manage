export type PassRate = {
  passed: number;
  total: number;
  rate: number;
};

export type DashboardSummary = {
  period: { from: string; to: string };
  masterResume: {
    id: number;
    title: string;
    completionRate: number;
    updatedAt: string;
  } | null;
  upcomingDeadlines: {
    id: number;
    company: string;
    position: string | null;
    deadline: string;
    dDay: number;
  }[];
  summaryStrip: {
    draft: number;
    submitted: number;
    inProgress: number;
    accepted: number;
    rejected: number;
  };
  passRates: {
    document: PassRate;
    interview: PassRate;
    final: PassRate;
  };
  activityGrass: { date: string; count: number }[];
};

export type PassRateStage = 'document' | 'interview' | 'final';

export type PassRateDetails = {
  stage: PassRateStage;
  passed: {
    id: number;
    company: string;
    position: string | null;
    eventAt: string;
  }[];
  failed: {
    id: number;
    company: string;
    position: string | null;
    eventAt: string;
  }[];
};
