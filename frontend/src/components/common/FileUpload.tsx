import { useRef, useState } from 'react';
import { fileApi, type UploadedFileResponse } from '../../lib/api/file';

type FileValue = {
  id: number;
  originalFilename: string;
  downloadUrl: string;
};

type Props = {
  value?: FileValue | null;
  onChange: (file: UploadedFileResponse | null) => void;
  accept?: string;
  maxSizeBytes?: number;
  label?: string;
};

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

function isImageMime(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(url);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  value,
  onChange,
  accept,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  label = '파일 선택',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectClick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size <= 0) {
      setError('빈 파일은 업로드할 수 없어요.');
      return;
    }
    if (file.size > maxSizeBytes) {
      setError(`파일이 너무 커요. 최대 ${formatBytes(maxSizeBytes)}까지 가능해요.`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const uploaded = await fileApi.upload(file);
      onChange(uploaded);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '파일 업로드에 실패했어요.';
      setError(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    setError(null);
    setDeleting(true);
    try {
      await fileApi.delete(value.id);
      onChange(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '파일 삭제에 실패했어요.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const hasValue = value != null;
  const showImageThumb = hasValue && isImageMime(value!.originalFilename);
  const thumbSrc = hasValue ? fileApi.downloadUrl(value!.id) : null;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {hasValue && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          {showImageThumb ? (
            <img
              src={thumbSrc!}
              alt={value!.originalFilename}
              className="h-14 w-14 rounded-md object-cover border border-slate-200"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-xs font-medium text-slate-500">
              FILE
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {value!.originalFilename}
            </p>
            <a
              href={thumbSrc!}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 hover:underline"
            >
              열기
            </a>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || uploading}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {deleting ? '삭제 중…' : '삭제'}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSelectClick}
          disabled={uploading || deleting}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              업로드 중…
            </>
          ) : (
            <>{hasValue ? '다른 파일 선택' : label}</>
          )}
        </button>
        <span className="text-xs text-slate-400">
          최대 {formatBytes(maxSizeBytes)}
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
