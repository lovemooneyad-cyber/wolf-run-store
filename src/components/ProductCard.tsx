import {useState} from 'react';
import {Check, Eye, ShoppingBag} from 'lucide-react';
import {Sneaker, SneakerSize} from '../types';
import {formatPrice} from '../utils/orderFormatting';
import {BundleSizeSelector} from './BundleSizeSelector';
import {SizeSelector} from './SizeSelector';
import {SneakerImage} from './SneakerImage';

interface ProductCardProps {
  sneaker: Sneaker;
  selectedSize: SneakerSize | null;
  selectedBundleSizes: Record<string, SneakerSize | null>;
  onSelectSize: (sneakerId: string, size: SneakerSize) => void;
  onSelectBundlePieceSize: (sneakerId: string, pieceId: string, size: SneakerSize) => void;
  onApplyBundleSizeToAll: (sneaker: Sneaker, size: SneakerSize) => void;
  onAddToCart: (
    sneaker: Sneaker,
    size: SneakerSize,
    quantity: number,
    bundleSizes?: Record<string, SneakerSize>
  ) => void;
  onOpenDetails: (sneaker: Sneaker) => void;
}

export function ProductCard({
  sneaker,
  selectedSize,
  selectedBundleSizes,
  onSelectSize,
  onSelectBundlePieceSize,
  onApplyBundleSizeToAll,
  onAddToCart,
  onOpenDetails,
}: ProductCardProps) {
  const [sizeError, setSizeError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isBundle = Boolean(sneaker.bundleItems && sneaker.bundleItems.length > 0);

  const handleSizeClick = (size: SneakerSize) => {
    onSelectSize(sneaker.id, size);
    if (sizeError) {
      setSizeError(false);
    }
  };

  const handleBundlePieceClick = (pieceId: string, size: SneakerSize) => {
    onSelectBundlePieceSize(sneaker.id, pieceId, size);
    if (sizeError) {
      setSizeError(false);
    }
  };

  const handleAddClick = () => {
    if (isBundle && sneaker.bundleItems) {
      const resolved: Record<string, SneakerSize> = {};
      for (const piece of sneaker.bundleItems) {
        const picked = selectedBundleSizes[piece.id];
        if (!picked) {
          setSizeError(true);
          return;
        }
        resolved[piece.id] = picked;
      }
      setSizeError(false);
      const primarySize = resolved[sneaker.bundleItems[0].id];
      onAddToCart(sneaker, primarySize, 1, resolved);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1600);
      return;
    }

    if (selectedSize === null) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(sneaker, selectedSize, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col bg-[#141418] border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40">
      <button
        type="button"
        onClick={() => onOpenDetails(sneaker)}
        className="relative aspect-[4/5] w-full bg-zinc-950 overflow-hidden text-right cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DC2626]"
        aria-label={`عرض تفاصيل ${sneaker.name}`}>
        <SneakerImage
          src={sneaker.image}
          alt={`${sneaker.name} - ${sneaker.colorway}`}
          title={sneaker.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </button>

      <div className="flex flex-1 flex-col p-5 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 truncate">
              <span>{sneaker.category}</span>
              {sneaker.availabilityNote && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#EF4444] font-semibold">{sneaker.availabilityNote}</span>
                </>
              )}
            </div>
            <span className="tabular-nums text-zinc-500 shrink-0">
              {sneaker.availableSizes[0]}–{sneaker.availableSizes[sneaker.availableSizes.length - 1]}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenDetails(sneaker)}
              className="text-right text-base sm:text-lg font-bold text-white hover:text-[#EF4444] transition-colors cursor-pointer leading-snug">
              {sneaker.name}
            </button>
            <div className="text-left shrink-0">
              <span className="block text-base font-bold text-white tabular-nums whitespace-nowrap">
                {formatPrice(sneaker.price)}
              </span>
              {sneaker.originalPrice && (
                <span className="block text-xs text-zinc-500 line-through tabular-nums whitespace-nowrap">
                  {formatPrice(sneaker.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {sneaker.arabicTagline}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-800/90 mt-auto space-y-4">
          {isBundle && sneaker.bundleItems ? (
            <BundleSizeSelector
              bundleItems={sneaker.bundleItems}
              selectedBundleSizes={selectedBundleSizes}
              onSelectPieceSize={handleBundlePieceClick}
              onApplyToAll={(size) => {
                onApplyBundleSizeToAll(sneaker, size);
                setSizeError(false);
              }}
              showError={sizeError}
              compact
            />
          ) : (
            <SizeSelector
              availableSizes={sneaker.availableSizes}
              selectedSize={selectedSize}
              onSelectSize={handleSizeClick}
              showError={sizeError}
              compact
            />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddClick}
              className={`flex-1 h-11 px-4 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-zinc-950 hover:bg-[#DC2626] hover:text-white'
              }`}>
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{isBundle ? 'تمت إضافة العرض' : `تمت الإضافة (${selectedSize})`}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>أضف للسلة</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpenDetails(sneaker)}
              className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-white hover:text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`عرض تفاصيل ${sneaker.name}`}>
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span>التفاصيل</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
