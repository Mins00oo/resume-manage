package com.resumemanage.resume.application.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeBasicInfo;
import com.resumemanage.resume.domain.ResumeCareer;
import com.resumemanage.resume.domain.ResumeCoverLetter;
import com.resumemanage.resume.domain.ResumeCoverLetterSection;
import com.resumemanage.resume.repository.ResumeAwardRepository;
import com.resumemanage.resume.repository.ResumeBasicInfoRepository;
import com.resumemanage.resume.repository.ResumeCareerRepository;
import com.resumemanage.resume.repository.ResumeCertificateRepository;
import com.resumemanage.resume.repository.ResumeCoverLetterRepository;
import com.resumemanage.resume.repository.ResumeCoverLetterSectionRepository;
import com.resumemanage.resume.repository.ResumeEducationRepository;
import com.resumemanage.resume.repository.ResumeLanguageRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import com.resumemanage.resume.repository.ResumeTrainingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 이력서를 Thymeleaf HTML 템플릿으로 렌더링한 뒤 OpenHTMLToPDF 로 PDF 바이트를 생성한다.
 *
 * <p><b>Font 관련 MVP 한계:</b> 현재 코드는 별도의 Korean 폰트 파일을 포함하지 않고
 * OS 기본 폰트(Windows: Malgun Gothic, macOS: AppleGothic 등)에 의존한다.
 * OpenHTMLToPDF 는 Java2D/AWT 가 아닌 iText/PDFBox 기반이라 시스템 폰트 자동 사용은 제한적이며
 * 한글이 tofu(□) 로 깨져 보일 수 있다. 운영 배포 전에 `/fonts/` 리소스 아래에
 * Pretendard 혹은 Noto Sans KR 같은 오픈 폰트 파일을 배치하고 아래 {@code buildPdfRendererBuilder}
 * 메서드에서 {@code builder.useFont(...)} 호출을 활성화해야 한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumePdfService {

    private static final DateTimeFormatter FILENAME_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ResumeRepository resumeRepository;
    private final ResumeBasicInfoRepository resumeBasicInfoRepository;
    private final ResumeEducationRepository resumeEducationRepository;
    private final ResumeCareerRepository resumeCareerRepository;
    private final ResumeLanguageRepository resumeLanguageRepository;
    private final ResumeCertificateRepository resumeCertificateRepository;
    private final ResumeAwardRepository resumeAwardRepository;
    private final ResumeTrainingRepository resumeTrainingRepository;
    private final ResumeCoverLetterRepository resumeCoverLetterRepository;
    private final ResumeCoverLetterSectionRepository resumeCoverLetterSectionRepository;
    private final SpringTemplateEngine templateEngine;

    /**
     * 이력서를 PDF 로 렌더링해 바이트 배열과 제안 파일명을 반환한다.
     */
    public ResumePdfResult generate(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));

        ResumePdfData data = loadData(resume);
        String html = renderHtml(data);
        byte[] bytes = renderPdf(html);
        String filename = suggestFilename(resume, data.basicInfo());
        return new ResumePdfResult(bytes, filename);
    }

    /**
     * 이력서에 딸린 모든 하위 컬렉션을 조회하고 PDF 데이터 객체로 조립한다.
     */
    private ResumePdfData loadData(Resume resume) {
        Long resumeId = resume.getId();

        ResumeBasicInfo basicInfo = resumeBasicInfoRepository.findById(resumeId).orElse(null);

        List<ResumeCareer> careers = resumeCareerRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId);

        ResumeCoverLetter coverLetter = resumeCoverLetterRepository.findById(resumeId).orElse(null);
        List<ResumeCoverLetterSection> coverLetterSections = coverLetter == null
                ? Collections.emptyList()
                : resumeCoverLetterSectionRepository.findAllByCoverLetterResumeIdOrderByOrderIndexAsc(resumeId);

        List<String> hiddenList = resume.getHiddenSections();
        Set<String> hiddenSet = (hiddenList == null || hiddenList.isEmpty())
                ? Collections.emptySet()
                : new HashSet<>(hiddenList);

        return new ResumePdfData(
                resume.getTitle(),
                resume.getUpdatedAt(),
                basicInfo,
                resumeEducationRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId),
                careers,
                resumeLanguageRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId),
                resumeCertificateRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId),
                resumeAwardRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId),
                resumeTrainingRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId),
                coverLetter,
                coverLetterSections,
                hiddenSet
        );
    }

    /**
     * Thymeleaf context 에 데이터를 주입하고 resume-pdf 템플릿을 렌더링한다.
     */
    private String renderHtml(ResumePdfData data) {
        Context context = new Context();
        context.setVariable("title", data.title());
        context.setVariable("updatedAt", data.updatedAt());
        context.setVariable("basicInfo", data.basicInfo());
        context.setVariable("educations", data.educations());
        context.setVariable("careers", data.careers());
        context.setVariable("languages", data.languages());
        context.setVariable("certificates", data.certificates());
        context.setVariable("awards", data.awards());
        context.setVariable("trainings", data.trainings());
        context.setVariable("coverLetter", data.coverLetter());
        context.setVariable("coverLetterSections", data.coverLetterSections());
        context.setVariable("hiddenSections", data.hiddenSections());
        return templateEngine.process("resume-pdf", context);
    }

    /**
     * HTML 문자열을 PDF 바이트로 변환한다.
     */
    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            // Font 한계: 한글 폰트 파일을 리소스에 넣게 되면 아래 한 줄 활성화 필요
            // builder.useFont(() -> getClass().getResourceAsStream("/fonts/Pretendard-Regular.otf"), "Pretendard");
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to render resume PDF", e);
        }
    }

    /**
     * {한글이름}_{이력서제목}_{yyyyMMdd}.pdf 형식의 파일명을 제안한다.
     * 공백은 underscore 로 바꾸고 파일명에 쓸 수 없는 문자를 제거한다.
     */
    public String suggestFilename(Resume resume, ResumeBasicInfo basicInfo) {
        String name = (basicInfo != null && basicInfo.getNameKo() != null && !basicInfo.getNameKo().isBlank())
                ? basicInfo.getNameKo()
                : "이력서";
        String safeName = sanitize(name);
        String safeTitle = sanitize(resume.getTitle() == null ? "resume" : resume.getTitle());
        String date = LocalDate.now().format(FILENAME_DATE_FORMAT);
        return safeName + "_" + safeTitle + "_" + date + ".pdf";
    }

    /**
     * 기존 {@link Resume} 만으로 파일명을 제안하고 싶을 때 사용할 수 있는 편의 메서드.
     * basicInfo 를 내부에서 조회한다.
     */
    public String suggestFilename(Resume resume) {
        ResumeBasicInfo basicInfo = resumeBasicInfoRepository.findById(resume.getId()).orElse(null);
        return suggestFilename(resume, basicInfo);
    }

    /**
     * 파일명에 부적합한 문자를 제거하고 공백을 underscore 로 치환한다.
     */
    private String sanitize(String raw) {
        String trimmed = raw.trim().replaceAll("\\s+", "_");
        // Windows/Unix 파일명에 금지된 문자 제거
        return trimmed.replaceAll("[\\\\/:*?\"<>|]", "");
    }
}
