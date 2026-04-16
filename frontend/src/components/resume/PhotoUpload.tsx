import { useRef } from 'react';
import { IconPlus, IconTrash } from '../icons/Icons';

type Props = {
  imageUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export default function PhotoUpload({ imageUrl, onUpload, onRemove, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('5MB 이하의 이미지만 업로드할 수 있어요.');
        return;
      }
      onUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={handleClick}
        className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-[var(--color-border-subtle)] hover:border-indigo-400 transition-colors"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="w-8 h-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-tertiary)] group-hover:text-indigo-500 transition-colors">
            <IconPlus className="w-8 h-8 mb-1" />
            <span className="text-[11px] font-medium">사진 추가</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-[var(--color-text-tertiary)]">권장 600px (5MB 이하)</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
