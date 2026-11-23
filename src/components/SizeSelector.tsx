import {AlertCircle, Check} from 'lucide-react';
import {SneakerSize} from '../types';

interface SizeSelectorProps {
  availableSizes: SneakerSize[];
  selectedSize: SneakerSize | null;
  onSelectSize: (size: SneakerSize) => void;
  showError?: boolean;
  compact?: boolean;
}

export function SizeSelector({
  availableSizes,
  selectedSize,
  onSelectSize,
  showError = false,
  compact = false,
}: SizeSelectorProps) {
  const minSize = availableSizes[0];
  const maxSize = availableSizes[availableSizes.length - 1];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="text-zinc-300 font-medium">
          المقاس المختار:{' '}
          {selectedSize !== null ? (
            <strong className="inline-flex items-center gap-1 text-[#EF4444] font-bold tabular-nums">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              {selectedSize}
            </strong>
          ) : (
            <span className="text-zinc-500 font-normal">لم يتم الاختيار</span>
          )}
        </span>
        <span className="text-[11px] text-zinc-400 tabular-nums">
          EU {minSize}–{maxSize}
        </span>
      </div>

      <div
        className="grid grid-cols-5 gap-2"
        role="group"
        aria-label="اختيار مقاس الحذاء">
        {availableSizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              aria-pressed={isSelected}
              className={`${
                compact ? 'h-10 text-sm' : 'h-11 text-sm'
              } rounded-lg font-display tabular-nums transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 cursor-pointer flex items-center justify-center whitespace-nowrap ${
                isSelected
                  ? 'bg-[#DC2626] text-white font-bold border-2 border-[#EF4444] shadow-sm scale-[1.02]'
                  : 'bg-zinc-900 text-zinc-100 font-medium border border-zinc-700 hover:border-white hover:bg-zinc-800'
              }`}>
              {size}
            </button>
          );
        })}
      </div>

      {showError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-[#DC2626] bg-red-950/70 px-3 py-2 text-xs font-semibold text-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
          <span>من فضلك اختر المقاس أولاً</span>
        </div>
      )}
    </div>
  );
}
