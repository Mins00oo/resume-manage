import {
  CompanyAvatar,
  StageBadge,
  dDayLabel,
  type ApplyItem,
} from './applyUi';
import { cn } from '../../lib/cn';

type Props = {
  items: ApplyItem[];
  onOpen: (id: number) => void;
};

export default function TableView({ items, onOpen }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <Th className="w-[28%]">회사 · 포지션</Th>
            <Th>상태</Th>
            <Th>경로</Th>
            <Th>연봉</Th>
            <Th>위치</Th>
            <Th className="text-right pr-6">마감</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const dday = dDayLabel(item.deadline);
            const urgent = dday && dday.days <= 3 && dday.days >= 0;
            return (
              <tr
                key={item.id}
                onClick={() => onOpen(item.id)}
                className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 pl-6 pr-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CompanyAvatar item={item} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                        {item.company}
                      </div>
                      <div className="text-[12px] text-slate-500 truncate">
                        {item.position}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <StageBadge item={item} />
                </td>
                <td className="py-3 pr-4 text-slate-600">{item.channel}</td>
                <td className="py-3 pr-4 text-slate-600">
                  {item.salary ?? '-'}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {item.location ?? '-'}
                </td>
                <td className="py-3 pr-6 text-right">
                  {dday ? (
                    <div>
                      <div
                        className={cn(
                          'text-[12.5px] font-bold',
                          urgent ? 'text-rose-600' : 'text-slate-700',
                        )}
                      >
                        {dday.label}
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">
                        {item.deadline?.replace(/-/g, '.')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn('py-3 pl-6 pr-4 first:pl-6', className)}>{children}</th>;
}
