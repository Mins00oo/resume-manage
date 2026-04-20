import { useEffect, useRef, useState } from 'react';
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

function formatSize(bytes: number | null | undefined): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfUploadSection({ label, hint, fileId, fileName, onFileChange, disabled }: Props) {
  const { toast, confirm } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // fileId 만 있고 fileName / size 가 비어 있으면 서버에서 메타 조회해 보완
  useEffect(() => {
    if (!fileId) { setSizeBytes(null); return; }
    let cancelled = false;
    fileApi.meta(fileId)
      .then((m) => {
        if (cancelled) return;
        if (!fileName) onFileChange(fileId, m.originalFilename);
        setSizeBytes(m.sizeBytes);
      })
      .catch(() => { /* 메타 실패해도 UI 는 파일 있음 상태 유지 */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

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
      setSizeBytes(result.sizeBytes);
    } catch {
      toast('파일 업로드에 실패했어요.', 'error');
    }
    e.target.value = '';
  };

  const handleView = async () => {
    if (!fileId) return;
    setOpening(true);
    try { await fileApi.openInNewTab(fileId); }
    catch { toast('파일을 열 수 없어요.', 'error'); }
    finally { setOpening(false); }
  };

  const handleDownload = async () => {
    if (!fileId) return;
    setDownloading(true);
    try { await fileApi.downloadAs(fileId, fileName ?? `${label}.pdf`); }
    catch { toast('다운로드에 실패했어요.', 'error'); }
    finally { setDownloading(false); }
  };

  const handleRemove = async () => {
    const ok = await confirm({
      title: `${label} 파일을 삭제할까요?`,
      description: '업로드된 PDF 가 서버에서 영구 삭제됩니다.',
      confirmLabel: '삭제',
      variant: 'danger',
    });
    if (!ok) return;
    if (fileId) {
      try { await fileApi.delete(fileId); } catch { /* ignore */ }
    }
    setSizeBytes(null);
    onFileChange(null, null);
  };

  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      {hint && <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">{hint}</p>}

      {fileId ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
          <svg className="w-5 h-5 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 18h10V6H7v12zm-2 2V4h14v16H5zm4-8h6v2H9v-2zm0-4h6v2H9V8z" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[var(--color-text-primary)] truncate">
              {fileName ?? '파일 불러오는 중…'}
            </div>
            {sizeBytes != null && (
              <div className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
                {formatSize(sizeBytes)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleView}
              disabled={disabled || opening}
              title="새 탭에서 열기"
              aria-label="새 탭에서 열기"
              className="w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-9.75 5.25L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={disabled || downloading}
              title="다운로드"
              aria-label="다운로드"
              className="w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              title="삭제"
              aria-label="삭제"
              className="w-8 h-8 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>
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
