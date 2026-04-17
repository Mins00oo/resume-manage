import { useRef } from 'react';
import { IconPlus, IconTrash } from '../icons/Icons';
import { fileApi } from '../../lib/api/file';
import { useToast } from '../common/Toast';

type Props = {
  label: string;
  hint?: string;
  fileId: number | null;
  fileName: string | null;
  onFileChange: (fileId: number | null, fileName: string | null) => void;
  disabled?: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function PdfUploadSection({ label, hint, fileId, fileName, onFileChange, disabled }: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast('PDF 파일만 업로드할 수 있어요.', 'warning');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      toast('10MB 이하의 파일만 업로드할 수 있어요.', 'warning');
      e.target.value = '';
      return;
    }

    try {
      const result = await fileApi.upload(file);
      onFileChange(result.id, result.originalFilename);
    } catch {
      toast('파일 업로드에 실패했어요.', 'error');
    }
    e.target.value = '';
  };

  const handleRemove = async () => {
    if (fileId) {
      try {
        await fileApi.delete(fileId);
      } catch {
        // ignore delete failure
      }
    }
    onFileChange(null, null);
  };

  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      {hint && <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">{hint}</p>}

      {fileId && fileName ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
          <svg className="w-5 h-5 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18h10V6H7v12zm-2 2V4h14v16H5zm4-8h6v2H9v-2zm0-4h6v2H9V8z" />
          </svg>
          <span className="flex-1 text-[13px] text-[var(--color-text-primary)] truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="w-full p-4 rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] hover:border-indigo-400 transition-colors text-center cursor-pointer group"
        >
          <IconPlus className="w-6 h-6 mx-auto mb-1 text-[var(--color-text-tertiary)] group-hover:text-indigo-500 transition-colors" />
          <p className="text-[12px] text-[var(--color-text-tertiary)] group-hover:text-indigo-500 transition-colors">
            PDF 파일을 업로드하세요
          </p>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">최대 10MB</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
