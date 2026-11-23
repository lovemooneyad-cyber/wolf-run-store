import {AlertCircle, Check, CopyCheck} from 'lucide-react';
import {BundlePiece, SneakerSize} from '../types';

interface BundleSizeSelectorProps {
  bundleItems: BundlePiece[];
  selectedBundleSizes: Record<string, SneakerSize | null>;
  onSelectPieceSize: (pieceId: string, size: SneakerSize) => void;
  onApplyToAll?: (size: SneakerSize) => void;
  showError?: boolean;
  compact?: boolean;
}

export function BundleSizeSelector({
  bundleItems,
  selectedBundleSizes,
  onSelectPieceSize,
  onApplyToAll,
  showError = false,
  compact = false,
}: BundleSizeSelectorProps) {
  const firstSelected = bundleItems
    .map((p) => selectedBundleSizes[p.id])
    .find((s): s is SneakerSize => s !== null && s !== undefined);

  const missingCount = bundleItems.filter((p) => !selectedBundleSizes[p.id]).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-zinc-300 font-semibold">
          اختر مقاس كل كوتشي في العرض:
        </span>
        {firstSelected && onApplyToAll && (
          <button
            type="button"
            onClick={() => onApplyToAll(firstSelected)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF4444] hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            <CopyCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>توحيد الكل على {firstSelected}</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {bundleItems.map((piece) => {
          const pieceSize = selectedBundleSizes[piece.id] ?? null;
          const hasPieceError = showError && pieceSize === null;

          return (
            <div
              key={piece.id}
              className={`rounded-lg border p-2.5 space-y-2 transition-colors ${
                hasPieceError
                  ? 'border-[#DC2626] bg-red-950/30'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-zinc-200 truncate">{piece.label}</span>
                <span className="text-zinc-400 shrink-0">
                  المقاس المختار:{' '}
                  {pieceSize !== null ? (
                    <strong className="inline-flex items-center gap-0.5 text-[#EF4444] font-bold tabular-nums">
                      <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                      {pieceSize}
                    </strong>
                  ) : (
                    <span className="text-zinc-500">لم يحدد</span>
                  )}
                </span>
              </div>

              <div
                className="grid grid-cols-5 gap-1.5"
                role="group"
                aria-label={`مقاس ${piece.label}`}>
                {piece.availableSizes.map((size) => {
                  const isSelected = pieceSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onSelectPieceSize(piece.id, size)}
                      aria-pressed={isSelected}
                      className={`${
                        compact ? 'h-9 text-xs' : 'h-10 text-sm'
                      } rounded-md font-display tabular-nums transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] cursor-pointer flex items-center justify-center whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#DC2626] text-white font-bold border-2 border-[#EF4444] shadow-sm'
                          : 'bg-zinc-950 text-zinc-100 font-medium border border-zinc-700 hover:border-white hover:bg-zinc-800'
                      }`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showError && missingCount > 0 && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-[#DC2626] bg-red-950/70 px-3 py-2 text-xs font-semibold text-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
          <span>من فضلك اختر المقاس أولاً لكل كوتشي داخل العرض</span>
        </div>
      )}
    </div>
  );
}
