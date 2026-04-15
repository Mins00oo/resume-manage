import { useNavigate } from 'react-router-dom';
import type { JobApplyListItem } from '../../types/jobApply';
import { formatDate } from '../../lib/formatDate';
import { employmentLabel } from '../../lib/statusLabel';
import StatusBadge from './StatusBadge';

type Props = {
  items: JobApplyListItem[];
};

export default function JobApplyTable({ items }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left font-medium">상태</th>
            <th className="px-4 py-3 text-left font-medium">회사</th>
            <th className="px-4 py-3 text-left font-medium">포지션</th>
            <th className="px-4 py-3 text-left font-medium">고용 형태</th>
            <th className="px-4 py-3 text-left font-medium">경로</th>
            <th className="px-4 py-3 text-left font-medium">마감일</th>
            <th className="px-4 py-3 text-left font-medium">제출일</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`/applies/${item.id}`)}
              className="cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3">
                <StatusBadge status={item.currentStatus} />
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {item.company}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {item.position ?? '-'}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {employmentLabel(item.employmentType)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {item.channel ?? '-'}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatDate(item.deadline)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatDate(item.submittedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
