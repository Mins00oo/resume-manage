import type { JobApplyStatus } from '../../types/jobApply';
import { statusColor, statusLabel } from '../../lib/statusLabel';

type Props = {
  status: JobApplyStatus;
  className?: string;
};

export default function StatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor(status)} ${className}`}
    >
      {statusLabel(status)}
    </span>
  );
}
