import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockResumes, type ResumeMeta } from '../mocks/data';
import {
  IconPlus,
  IconPencil,
  IconArrowUpRight,
  IconSparkles,
  IconDownload,
  IconSearch,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';

export default function ResumesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'master' | 'tailored'>('all');

  const master = mockResumes.find((r) => r.isMaster)!;
  const tailored = mockResumes.filter((r) => !r.isMaster);

  const visible = useMemo(() => {
    let list = filter === 'master' ? [master] : filter === 'tailored' ? tailored : mockResumes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.linkedCompany ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, filter, master, tailored]);

  return (
    <div className="space-y-6">
      {/* Master card */}
      <section
        className="relative overflow-hidden rounded-2xl text-white cursor-pointer group"
        onClick={() => navigate(`/resumes/${master.id}`)}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 70%, #581c87 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%, rgba(129,140,248,0.5), transparent 50%), radial-gradient(circle at 0% 100%, rgba(217,70,239,0.35), transparent 50%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative p-7 lg:p-9 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] tracking-wide text-white/85 backdrop-blur">
              <IconSparkles className="w-3 h-3 text-fuchsia-200" />
              Master Resume
            </div>
            <h2 className="mt-3 text-[30px] font-bold tracking-tight leading-tight">
              {master.title}
            </h2>
            <p className="text-[14px] text-white/60 mt-1 max-w-lg">
              {master.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/resumes/${master.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-900 bg-white hover:bg-white/90 transition-colors"
              >
                <IconPencil className="w-3.5 h-3.5" />
                편집하기
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('PDF 내보내기는 백엔드 연동 후 사용할 수 있어요.');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/85 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <IconDownload className="w-3.5 h-3.5" />
                PDF 내보내기
              </button>
            </div>
          </div>

          {/* Completion ring */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-40 h-40">
              <svg width={160} height={160} viewBox="0 0 160 160">
                <circle
                  cx={80}
                  cy={80}
                  r={68}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={10}
                  fill="none"
                />
                <circle
                  cx={80}
                  cy={80}
                  r={68}
                  stroke="url(#grad)"
                  strokeWidth={10}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={
                    2 * Math.PI * 68 - (master.completionRate / 100) * 2 * Math.PI * 68
                  }
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#a5b4fc" />
                    <stop offset="1" stopColor="#f0abfc" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                  완성도
                </div>
                <div className="text-[40px] font-extrabold tracking-tight leading-none mt-1">
                  {master.completionRate}
                  <span className="text-[16px] text-white/50 font-bold">%</span>
                </div>
                <div className="text-[11px] text-white/50 mt-1">7 / 8 섹션</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[15px] font-bold text-slate-900">이력서 목록</div>
          <div className="text-[12px] text-slate-500 mt-0.5">
            회사별 맞춤 이력서를 관리하세요
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이력서 검색"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {(['all', 'master', 'tailored'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors',
                  filter === key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {key === 'all' ? '전체' : key === 'master' ? '마스터' : '맞춤'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/resumes/new')}
            className="btn-primary"
          >
            <IconPlus className="w-4 h-4" />
            이력서 추가
          </button>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onClick={() => navigate(`/resumes/${resume.id}`)}
          />
        ))}
        <CreateCard onClick={() => navigate('/resumes/new')} />
      </section>
    </div>
  );
}

function ResumeCard({
  resume,
  onClick,
}: {
  resume: ResumeMeta;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-hover p-0 overflow-hidden text-left group"
    >
      {/* Thumbnail: tiny A4 preview */}
      <div className="relative h-40 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${resume.accentColor}10, ${resume.accentColor}25)`,
          }}
        />
        <div className="absolute top-4 left-4 right-4 bg-white rounded shadow-sm p-3 origin-top scale-[0.75]">
          <div
            className="h-1.5 w-2/3 rounded-full mb-1.5"
            style={{ backgroundColor: resume.accentColor }}
          />
          <div className="h-1 w-1/2 bg-slate-200 rounded-full mb-2" />
          <div className="space-y-1 mt-2">
            <div className="h-0.5 w-full bg-slate-100 rounded-full" />
            <div className="h-0.5 w-4/5 bg-slate-100 rounded-full" />
            <div className="h-0.5 w-3/4 bg-slate-100 rounded-full" />
          </div>
          <div className="flex gap-1 mt-2">
            <div className="h-1 w-8 bg-slate-100 rounded-full" />
            <div className="h-1 w-6 bg-slate-100 rounded-full" />
            <div className="h-1 w-10 bg-slate-100 rounded-full" />
          </div>
        </div>
        {resume.isMaster && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9.5px] font-bold text-white bg-slate-900/80 backdrop-blur tracking-wide">
            MASTER
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
              {resume.title}
            </div>
            <div className="text-[11.5px] text-slate-500 truncate mt-0.5">
              {resume.description}
            </div>
          </div>
          <IconArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${resume.completionRate}%`,
                backgroundColor: resume.accentColor,
              }}
            />
          </div>
          <div className="text-[11px] font-bold text-slate-700 tabular-nums">
            {resume.completionRate}%
          </div>
        </div>
        <div className="text-[10.5px] text-slate-400 mt-2">
          수정 {resume.updatedAt.replace(/-/g, '.')}
        </div>
      </div>
    </button>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-indigo-300 flex flex-col items-center justify-center p-8 min-h-[260px] transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
        <IconPlus className="w-5 h-5" />
      </div>
      <div className="text-[13.5px] font-bold text-slate-700 mt-3">
        새 이력서 만들기
      </div>
      <div className="text-[11.5px] text-slate-500 mt-1">
        마스터에서 복제하거나 처음부터
      </div>
    </button>
  );
}
