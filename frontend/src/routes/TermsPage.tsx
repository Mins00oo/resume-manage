export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <article className="card p-6 md:p-8 space-y-6 text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
        <header>
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-1">이용약관</h1>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">시행일: 2026-04-17</p>
        </header>

        <Section title="1. 서비스 소개">
          <p>
            Resume Manage 는 이력서 작성, 지원 현황 관리, 면접 일정 알림 등을 제공하는 개인 프로젝트입니다. 상업적
            목적의 서비스가 아니며, 운영/데이터 안정성이 상용 서비스 수준에 미치지 못할 수 있습니다.
          </p>
        </Section>

        <Section title="2. 계정">
          <p>
            Google OAuth 로그인을 통해 계정을 생성/이용할 수 있습니다. 계정에 등록된 이력서, 지원 내역 등의 데이터에
            대한 관리 책임은 사용자 본인에게 있습니다.
          </p>
        </Section>

        <Section title="3. 책임의 제한">
          <p>
            본 서비스는 무상으로 제공되며, 서비스 중단 · 데이터 유실 · 알림 미발송 등으로 인한 손해에 대해 운영자는
            법이 허용하는 최대 범위에서 책임을 지지 않습니다. 중요한 자료는 별도로 백업하세요.
          </p>
        </Section>

        <Section title="4. 금지 행위">
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 계정/정보를 무단으로 수집하는 행위</li>
            <li>서비스의 정상 운영을 방해하는 모든 행위</li>
            <li>법령에 위반되는 내용을 업로드하는 행위</li>
          </ul>
        </Section>

        <Section title="5. 약관 변경">
          <p>약관은 필요 시 변경될 수 있으며, 변경 사항은 서비스 내 공지를 통해 안내합니다.</p>
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
