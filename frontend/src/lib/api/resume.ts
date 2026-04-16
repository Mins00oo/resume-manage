import { api } from '../api';
import type { ApiResponse } from '../../types/api';
import type {
  ResumeSummary,
  ResumeDetail,
  ResumeBasicInfo,
  ResumeBasicInfoRequest,
  ResumeEducation,
  ResumeEducationRequest,
  ResumeCareer,
  ResumeCareerRequest,
  ResumeCareerProject,
  ResumeCareerProjectRequest,
  ResumeLanguage,
  ResumeLanguageRequest,
  ResumeCertificate,
  ResumeCertificateRequest,
  ResumeAward,
  ResumeAwardRequest,
  ResumeTraining,
  ResumeTrainingRequest,
  ResumeCoverLetter,
  ResumeCoverLetterRequest,
  ResumeCoverLetterSection,
  ResumeCoverLetterSectionRequest,
} from '../../types/resume';

export const resumeApi = {
  /* ------------------------------------------------------------------ */
  /* Resume root                                                         */
  /* ------------------------------------------------------------------ */

  list: (): Promise<ResumeSummary[]> =>
    api
      .get<ApiResponse<ResumeSummary[]>>('/api/resumes')
      .then((r) => r.data.data ?? []),

  create: (title: string): Promise<number> =>
    api
      .post<ApiResponse<{ id: number }>>('/api/resumes', { title })
      .then((r) => {
        if (!r.data.data) throw new Error('이력서 생성 응답이 비어 있어요.');
        return r.data.data.id;
      }),

  get: (id: number): Promise<ResumeDetail> =>
    api
      .get<ApiResponse<ResumeDetail>>(`/api/resumes/${id}`)
      .then((r) => {
        if (!r.data.data) throw new Error('이력서를 찾을 수 없어요.');
        return r.data.data;
      }),

  updateTitle: (id: number, title: string): Promise<void> =>
    api
      .patch<ApiResponse<void>>(`/api/resumes/${id}`, { title })
      .then(() => undefined),

  delete: (id: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${id}`)
      .then(() => undefined),

  duplicate: (id: number): Promise<number> =>
    api
      .post<ApiResponse<{ id: number }>>(`/api/resumes/${id}/duplicate`)
      .then((r) => {
        if (!r.data.data) throw new Error('이력서 복제 응답이 비어 있어요.');
        return r.data.data.id;
      }),

  setMaster: (id: number): Promise<void> =>
    api
      .post<ApiResponse<void>>(`/api/resumes/${id}/master`)
      .then(() => undefined),

  unsetMaster: (id: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${id}/master`)
      .then(() => undefined),

  downloadPdf: (id: number): Promise<void> =>
    api
      .get(`/api/resumes/${id}/pdf`, { responseType: 'blob' })
      .then((r) => {
        const disposition = r.headers['content-disposition'] as string | undefined;
        let filename = `resume-${id}.pdf`;
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'";\n]*)\1/);
          if (match?.[2]) filename = decodeURIComponent(match[2]);
        }
        const url = window.URL.createObjectURL(r.data as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }),

  /* ------------------------------------------------------------------ */
  /* Basic Info                                                          */
  /* ------------------------------------------------------------------ */

  getBasicInfo: (resumeId: number): Promise<ResumeBasicInfo | null> =>
    api
      .get<ApiResponse<ResumeBasicInfo>>(`/api/resumes/${resumeId}/basic-info`)
      .then((r) => r.data.data ?? null),

  updateBasicInfo: (resumeId: number, body: ResumeBasicInfoRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/basic-info`, body)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Educations                                                          */
  /* ------------------------------------------------------------------ */

  listEducations: (resumeId: number): Promise<ResumeEducation[]> =>
    api
      .get<ApiResponse<ResumeEducation[]>>(`/api/resumes/${resumeId}/educations`)
      .then((r) => r.data.data ?? []),

  createEducation: (resumeId: number, body: ResumeEducationRequest): Promise<ResumeEducation> =>
    api
      .post<ApiResponse<ResumeEducation>>(`/api/resumes/${resumeId}/educations`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('학력 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateEducation: (resumeId: number, sectionId: number, body: ResumeEducationRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/educations/${sectionId}`, body)
      .then(() => undefined),

  deleteEducation: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/educations/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Careers                                                             */
  /* ------------------------------------------------------------------ */

  listCareers: (resumeId: number): Promise<ResumeCareer[]> =>
    api
      .get<ApiResponse<ResumeCareer[]>>(`/api/resumes/${resumeId}/careers`)
      .then((r) => r.data.data ?? []),

  createCareer: (resumeId: number, body: ResumeCareerRequest): Promise<ResumeCareer> =>
    api
      .post<ApiResponse<ResumeCareer>>(`/api/resumes/${resumeId}/careers`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('경력 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateCareer: (resumeId: number, sectionId: number, body: ResumeCareerRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/careers/${sectionId}`, body)
      .then(() => undefined),

  deleteCareer: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/careers/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Career Projects                                                     */
  /* ------------------------------------------------------------------ */

  listCareerProjects: (resumeId: number, careerId: number): Promise<ResumeCareerProject[]> =>
    api
      .get<ApiResponse<ResumeCareerProject[]>>(
        `/api/resumes/${resumeId}/careers/${careerId}/projects`,
      )
      .then((r) => r.data.data ?? []),

  createCareerProject: (
    resumeId: number,
    careerId: number,
    body: ResumeCareerProjectRequest,
  ): Promise<ResumeCareerProject> =>
    api
      .post<ApiResponse<ResumeCareerProject>>(
        `/api/resumes/${resumeId}/careers/${careerId}/projects`,
        body,
      )
      .then((r) => {
        if (!r.data.data) throw new Error('프로젝트 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateCareerProject: (
    resumeId: number,
    careerId: number,
    projectId: number,
    body: ResumeCareerProjectRequest,
  ): Promise<void> =>
    api
      .put<ApiResponse<void>>(
        `/api/resumes/${resumeId}/careers/${careerId}/projects/${projectId}`,
        body,
      )
      .then(() => undefined),

  deleteCareerProject: (
    resumeId: number,
    careerId: number,
    projectId: number,
  ): Promise<void> =>
    api
      .delete<ApiResponse<void>>(
        `/api/resumes/${resumeId}/careers/${careerId}/projects/${projectId}`,
      )
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Languages                                                           */
  /* ------------------------------------------------------------------ */

  listLanguages: (resumeId: number): Promise<ResumeLanguage[]> =>
    api
      .get<ApiResponse<ResumeLanguage[]>>(`/api/resumes/${resumeId}/languages`)
      .then((r) => r.data.data ?? []),

  createLanguage: (resumeId: number, body: ResumeLanguageRequest): Promise<ResumeLanguage> =>
    api
      .post<ApiResponse<ResumeLanguage>>(`/api/resumes/${resumeId}/languages`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('언어 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateLanguage: (resumeId: number, sectionId: number, body: ResumeLanguageRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/languages/${sectionId}`, body)
      .then(() => undefined),

  deleteLanguage: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/languages/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Certificates                                                        */
  /* ------------------------------------------------------------------ */

  listCertificates: (resumeId: number): Promise<ResumeCertificate[]> =>
    api
      .get<ApiResponse<ResumeCertificate[]>>(`/api/resumes/${resumeId}/certificates`)
      .then((r) => r.data.data ?? []),

  createCertificate: (resumeId: number, body: ResumeCertificateRequest): Promise<ResumeCertificate> =>
    api
      .post<ApiResponse<ResumeCertificate>>(`/api/resumes/${resumeId}/certificates`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('자격증 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateCertificate: (resumeId: number, sectionId: number, body: ResumeCertificateRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/certificates/${sectionId}`, body)
      .then(() => undefined),

  deleteCertificate: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/certificates/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Awards                                                              */
  /* ------------------------------------------------------------------ */

  listAwards: (resumeId: number): Promise<ResumeAward[]> =>
    api
      .get<ApiResponse<ResumeAward[]>>(`/api/resumes/${resumeId}/awards`)
      .then((r) => r.data.data ?? []),

  createAward: (resumeId: number, body: ResumeAwardRequest): Promise<ResumeAward> =>
    api
      .post<ApiResponse<ResumeAward>>(`/api/resumes/${resumeId}/awards`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('수상 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateAward: (resumeId: number, sectionId: number, body: ResumeAwardRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/awards/${sectionId}`, body)
      .then(() => undefined),

  deleteAward: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/awards/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Trainings                                                           */
  /* ------------------------------------------------------------------ */

  listTrainings: (resumeId: number): Promise<ResumeTraining[]> =>
    api
      .get<ApiResponse<ResumeTraining[]>>(`/api/resumes/${resumeId}/trainings`)
      .then((r) => r.data.data ?? []),

  createTraining: (resumeId: number, body: ResumeTrainingRequest): Promise<ResumeTraining> =>
    api
      .post<ApiResponse<ResumeTraining>>(`/api/resumes/${resumeId}/trainings`, body)
      .then((r) => {
        if (!r.data.data) throw new Error('교육 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateTraining: (resumeId: number, sectionId: number, body: ResumeTrainingRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/trainings/${sectionId}`, body)
      .then(() => undefined),

  deleteTraining: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(`/api/resumes/${resumeId}/trainings/${sectionId}`)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Cover Letter                                                        */
  /* ------------------------------------------------------------------ */

  getCoverLetter: (resumeId: number): Promise<ResumeCoverLetter | null> =>
    api
      .get<ApiResponse<ResumeCoverLetter>>(`/api/resumes/${resumeId}/cover-letter`)
      .then((r) => r.data.data ?? null),

  updateCoverLetter: (resumeId: number, body: ResumeCoverLetterRequest): Promise<void> =>
    api
      .put<ApiResponse<void>>(`/api/resumes/${resumeId}/cover-letter`, body)
      .then(() => undefined),

  /* ------------------------------------------------------------------ */
  /* Cover Letter Sections                                               */
  /* ------------------------------------------------------------------ */

  listCoverLetterSections: (resumeId: number): Promise<ResumeCoverLetterSection[]> =>
    api
      .get<ApiResponse<ResumeCoverLetterSection[]>>(
        `/api/resumes/${resumeId}/cover-letter/sections`,
      )
      .then((r) => r.data.data ?? []),

  createCoverLetterSection: (
    resumeId: number,
    body: ResumeCoverLetterSectionRequest,
  ): Promise<ResumeCoverLetterSection> =>
    api
      .post<ApiResponse<ResumeCoverLetterSection>>(
        `/api/resumes/${resumeId}/cover-letter/sections`,
        body,
      )
      .then((r) => {
        if (!r.data.data) throw new Error('자소서 항목 생성 응답이 비어 있어요.');
        return r.data.data;
      }),

  updateCoverLetterSection: (
    resumeId: number,
    sectionId: number,
    body: ResumeCoverLetterSectionRequest,
  ): Promise<void> =>
    api
      .put<ApiResponse<void>>(
        `/api/resumes/${resumeId}/cover-letter/sections/${sectionId}`,
        body,
      )
      .then(() => undefined),

  deleteCoverLetterSection: (resumeId: number, sectionId: number): Promise<void> =>
    api
      .delete<ApiResponse<void>>(
        `/api/resumes/${resumeId}/cover-letter/sections/${sectionId}`,
      )
      .then(() => undefined),
};
