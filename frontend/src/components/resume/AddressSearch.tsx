declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { roadAddress: string; jibunAddress: string; zonecode: string }) => void;
      }) => { open: () => void };
    };
  }
}

import { useToast } from '../common/Toast';

type Props = {
  value: string;
  onChange: (address: string) => void;
  detailValue?: string;
  onDetailChange?: (detail: string) => void;
};

export default function AddressSearch({ value, onChange, detailValue, onDetailChange }: Props) {
  const { toast } = useToast();
  const handleSearch = () => {
    if (!window.daum?.Postcode) {
      toast('주소 검색 서비스를 불러오지 못했어요. 잠시 후 다시 시도해주세요.', 'error');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        onChange(data.roadAddress || data.jibunAddress);
      },
    }).open();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          readOnly
          placeholder="주소를 검색하세요"
          className="input-base flex-1 cursor-pointer"
          onClick={handleSearch}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="shrink-0 px-4 py-2 text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          검색
        </button>
      </div>
      {onDetailChange && (
        <input
          type="text"
          value={detailValue ?? ''}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder="상세 주소 (동/호수)"
          className="input-base w-full"
        />
      )}
    </div>
  );
}
