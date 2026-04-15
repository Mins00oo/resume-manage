# Resume Manage API Spec — Phase 4-7

API 계약 문서. 백엔드·프론트엔드가 똑같이 이걸 보고 구현한다.

모든 응답은 `ApiResponse<T>` 래핑:
```json
{ "success": true,  "data": {...}, "error": null }
{ "success": false, "data": null, "error": { "code": "XXX_001", "message": "..." } }
```

모든 보호 엔드포인트는 `Authorization: Bearer <JWT>` 필요.

---

## JobApply (지원 내역)

### `GET /api/job-applies` — 목록
쿼리 파라미터: `status` (optional, enum), `from` (yyyy-MM-dd), `to`, `search` (company name)

응답: `ApiResponse<JobApplyListItem[]>`

```ts
type JobApplyListItem = {
  id: number;
  company: string;
  position: string | null;
  currentStatus: JobApplyStatus;
  employmentType: EmploymentType | null;
  channel: string | null;
  deadline: string | null;        // ISO date yyyy-MM-dd
  submittedAt: string | null;
  updatedAt: string;               // ISO datetime
};
```

### `POST /api/job-applies` — 생성
요청:
```ts
type JobApplyCreateRequest = {
  company: string;                 // required
  position?: string;
  jobPostingUrl?: string;
  employmentType?: EmploymentType; // NEW / EXPERIENCED / INTERN / CONTRACT
  channel?: string;
  deadline?: string;               // yyyy-MM-dd
  memo?: string;
};
```
응답: `ApiResponse<{ id: number }>`

### `GET /api/job-applies/{id}` — 상세
응답: `ApiResponse<JobApplyDetail>`

```ts
type JobApplyDetail = JobApplyListItem & {
  jobPostingUrl: string | null;
  wentThroughDocument: boolean;
  wentThroughCoding: boolean;
  wentThroughAssignment: boolean;
  wentThroughInterview: boolean;
  memo: string | null;
  createdAt: string;
};
```

### `PATCH /api/job-applies/{id}` — 기본 정보 수정
요청: `JobApplyUpdateRequest` (동일 필드 전부 optional)
응답: `ApiResponse<Void>`

### `DELETE /api/job-applies/{id}` — 소프트 삭제
응답: `ApiResponse<Void>`

### `POST /api/job-applies/{id}/transition` — 상태 전이
요청:
```ts
type JobApplyTransitionRequest = { to: JobApplyStatus };
```
응답: `ApiResponse<Void>`

내부적으로 `JobApply.transitionTo()` 호출. 종료 상태에서 전이 시도 시 400.

### Enum

```ts
type JobApplyStatus =
  | 'DRAFT' | 'SUBMITTED'
  | 'DOCUMENT_PASSED' | 'DOCUMENT_FAILED'
  | 'CODING_IN_PROGRESS' | 'CODING_PASSED' | 'CODING_FAILED'
  | 'ASSIGNMENT_IN_PROGRESS' | 'ASSIGNMENT_PASSED' | 'ASSIGNMENT_FAILED'
  | 'INTERVIEW_IN_PROGRESS' | 'INTERVIEW_PASSED' | 'INTERVIEW_FAILED'
  | 'FINAL_ACCEPTED' | 'FINAL_REJECTED';

type EmploymentType = 'NEW' | 'EXPERIENCED' | 'INTERN' | 'CONTRACT';
```

한글 라벨은 프론트엔드가 갖고 있음 (`statusLabel`, `statusColor` 유틸).

---

## Dashboard

### `GET /api/dashboard/summary` — 대시보드 한 방에
쿼리 파라미터: `period` (`1m` | `3m` | `6m` | `all`, default `3m`), `from`, `to` (custom 시)

응답: `ApiResponse<DashboardSummary>`

```ts
type DashboardSummary = {
  period: { from: string; to: string };        // ISO date
  masterResume: {
    id: number;
    title: string;
    completionRate: number;                     // 0~100
    updatedAt: string;
  } | null;                                     // 없으면 null
  upcomingDeadlines: {                          // 7일 이내, 종료 제외, 최대 10
    id: number;
    company: string;
    position: string | null;
    deadline: string;
    dDay: number;                               // 오늘=0, 내일=1
  }[];
  summaryStrip: {
    draft: number;        // DRAFT 수
    submitted: number;    // 기간 내 submittedAt 있는 것
    inProgress: number;   // 제출했고 종료 아닌 것
    accepted: number;     // FINAL_ACCEPTED
    rejected: number;     // *_FAILED + FINAL_REJECTED
  };
  passRates: {
    document: PassRate;
    interview: PassRate;
    final: PassRate;
  };
  activityGrass: {
    date: string;         // yyyy-MM-dd
    count: number;        // 그 날 submittedAt 건수
  }[];                    // 기간 전체 범위, 데이터 없는 날도 포함 (count=0)
};

type PassRate = {
  passed: number;
  total: number;                                // 분모
  rate: number;                                 // 0~1 소수. total=0 이면 0
};
```

### `GET /api/dashboard/pass-rate-details` — 카드 드릴다운
쿼리: `stage` (`document`|`interview`|`final`), `period` (same as summary), `from`, `to`

응답: `ApiResponse<PassRateDetails>`

```ts
type PassRateDetails = {
  stage: 'document' | 'interview' | 'final';
  passed: { id: number; company: string; position: string | null; eventAt: string }[];
  failed: { id: number; company: string; position: string | null; eventAt: string }[];
};
```

구현 주의:
- **document**: `went_through_document = true` 인 것. passed = currentStatus ∈ {DOCUMENT_PASSED 이후 모든 상태 (코테/과제/면접/최종)}, failed = currentStatus = DOCUMENT_FAILED
- **interview**: `went_through_interview = true` 인 것. passed = currentStatus ∈ {INTERVIEW_PASSED, FINAL_*}, failed = currentStatus = INTERVIEW_FAILED
- **final**: `submittedAt` 있는 것 전체가 분모. passed = currentStatus = FINAL_ACCEPTED, failed = currentStatus = FINAL_REJECTED

**중간 단계 (서류 미결 등) 는 분자·분모 양쪽에 포함 안 됨.**

---

## 파일 업로드 (Phase 6)

### `POST /api/files` — 업로드
`multipart/form-data`, 필드명 `file`
응답: `ApiResponse<UploadedFileResponse>`

```ts
type UploadedFileResponse = {
  id: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;   // /api/files/{id}
  createdAt: string;
};
```

### `GET /api/files/{id}` — 다운로드
응답: 원본 파일 스트리밍. `Content-Disposition: inline; filename="원본파일명"`
소유자가 아니면 403.

### `DELETE /api/files/{id}` — 소프트 삭제
응답: `ApiResponse<Void>`

제한: 파일 크기 5MB, 허용 mime type: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

---

## Resume PDF (Phase 7)

### `GET /api/resumes/{id}/pdf` — PDF 다운로드
쿼리 파라미터 없음.

응답: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="{title}_{yyyyMMdd}.pdf"`

비공개 이력서(다른 사용자 소유) 요청 시 404.

**PDF 레이아웃**: 마이다스 스타일 카드 구조
- 섹션별로 카드 (기본정보, 학력, 경력, 어학, 자격, 수상, 교육, 자기소개서)
- 숨김 섹션(`Resume.hiddenSections`)은 제외
- 한글 폰트 임베드 (Pretendard 또는 시스템 폴백)

---

## 기존 엔드포인트 (이미 구현됨)

- `POST /oauth2/authorization/google` — 구글 로그인 시작
- `GET /login/oauth2/code/google` — OAuth 콜백
- `GET /api/me` — 현재 로그인 사용자
- `GET /api/resumes` — 이력서 목록
- `POST /api/resumes` — 이력서 생성
- `GET /api/resumes/{id}` — 이력서 상세
- `PATCH /api/resumes/{id}` — 이력서 제목 수정
- `DELETE /api/resumes/{id}` — 이력서 삭제
- `POST /api/resumes/{id}/duplicate` — 이력서 복제
- `POST /api/resumes/{id}/master` — 대표 이력서 지정
- `DELETE /api/resumes/{id}/master` — 대표 해제
