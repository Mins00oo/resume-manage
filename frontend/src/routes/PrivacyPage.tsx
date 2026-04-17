export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <article className="card p-6 md:p-8 space-y-6 text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
        <header>
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-1">개인정보 처리방침</h1>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">시행일: 2026-04-17</p>
        </header>

        <Section title="1. 수집하는 개인정보">
          <p>서비스 이용을 위해 아래 정보를 수집합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>이름, 이메일 — Google 로그인 시 자동으로 제공됨</li>
            <li>프로필 이미지 URL — Google 프로필 사진</li>
            <li>사용자가 직접 입력한 이력서/지원 내역 등 서비스 데이터</li>
            <li>Web Push 구독 정보 (알림을 허용한 경우)</li>
          </ul>
        </Section>

        <Section title="2. 이용 목적">
          <ul className="list-disc pl-5 space-y-1">
            <li>로그인 및 본인 확인</li>
            <li>이력서/지원 관리 기능 제공</li>
            <li>지원 마감, 면접 일정 푸시 알림 발송</li>
          </ul>
        </Section>

        <Section title="3. 보관 기간">
          <p>
            계정 탈퇴 요청 시 30일간 보관된 뒤 완전히 삭제됩니다. 보관 기간 중 다시 로그인하면 복구됩니다. 법령에서
            별도 보관을 요구하는 경우에는 해당 기간 동안 분리 보관합니다.
          </p>
        </Section>

        <Section title="4. 제3자 제공">
          <p>사용자가 동의한 경우를 제외하고 개인정보를 외부에 제공하지 않습니다.</p>
        </Section>

        <Section title="5. 사용자의 권리">
          <p>
            언제든 서비스 내 '설정 → 계정 삭제'에서 계정과 데이터를 삭제할 수 있습니다. 그 외 문의는 아래 메일로
            연락 주세요.
          </p>
        </Section>

        <Section title="6. 문의">
          <p>
            <a href="mailto:alstn7223@gmail.com" className="text-indigo-600 dark:text-indigo-400">
              alstn7223@gmail.com
            </a>
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-2">{title}</h2>
      {children}
    </section>
  );
}
