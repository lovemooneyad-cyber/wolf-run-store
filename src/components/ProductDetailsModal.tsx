import {useEffect, useState} from 'react';
import {Check, MessageCircle, Minus, Plus, ShoppingBag, X} from 'lucide-react';
import {Sneaker, SneakerSize} from '../types';
import {
  buildDirectOrderWhatsAppMessage,
  DELIVERY_WINDOW_TEXT,
  formatPrice,
  getWhatsAppHref,
} from '../utils/orderFormatting';
import {BundleSizeSelector} from './BundleSizeSelector';
import {SizeSelector} from './SizeSelector';
import {SneakerImage} from './SneakerImage';

interface ProductDetailsModalProps {
  sneaker: Sneaker | null;
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
  onClose: () => void;
}

export function ProductDetailsModal({
  sneaker,
  selectedSize,
  selectedBundleSizes,
  onSelectSize,
  onSelectBundlePieceSize,
  onApplyBundleSizeToAll,
  onAddToCart,
  onClose,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [directOrderPreview, setDirectOrderPreview] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(1);
    setSizeError(false);
    setAddedFeedback(false);
    setDirectOrderPreview(null);
  }, [sneaker?.id]);

  useEffect(() => {
    if (!sneaker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sneaker, onClose]);

  if (!sneaker) return null;

  const isBundle = Boolean(sneaker.bundleItems && sneaker.bundleItems.length > 0);
  const minSize = sneaker.availableSizes[0];
  const maxSize = sneaker.availableSizes[sneaker.availableSizes.length - 1];

  const resolveSelection = (): {
    primarySize: SneakerSize;
    bundleMap?: Record<string, SneakerSize>;
  } | null => {
    if (isBundle && sneaker.bundleItems) {
      const resolved: Record<string, SneakerSize> = {};
      for (const piece of sneaker.bundleItems) {
        const picked = selectedBundleSizes[piece.id];
        if (!picked) return null;
        resolved[piece.id] = picked;
      }
      return {
        primarySize: resolved[sneaker.bundleItems[0].id],
        bundleMap: resolved,
      };
    }
    if (selectedSize === null) return null;
    return {primarySize: selectedSize};
  };

  const handleSizeSelect = (size: SneakerSize) => {
    onSelectSize(sneaker.id, size);
    setSizeError(false);
    setDirectOrderPreview(null);
  };

  const handleBundlePieceSelect = (pieceId: string, size: SneakerSize) => {
    onSelectBundlePieceSize(sneaker.id, pieceId, size);
    setSizeError(false);
    setDirectOrderPreview(null);
  };

  const handleAddToCart = () => {
    const resolved = resolveSelection();
    if (!resolved) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(sneaker, resolved.primarySize, quantity, resolved.bundleMap);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleDirectOrder = () => {
    const resolved = resolveSelection();
    if (!resolved) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const message = buildDirectOrderWhatsAppMessage(
      sneaker,
      resolved.primarySize,
      quantity,
      resolved.bundleMap
    );
    setDirectOrderPreview(message);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}>
      <div
        className="relative w-full max-w-4xl bg-[#141418] text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق تفاصيل المنتج"
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-zinc-900/95 border border-zinc-700 text-zinc-200 hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 bg-zinc-950 flex items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-l border-zinc-800">
            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-zinc-800 bg-black">
              <SneakerImage
                src={sneaker.image}
                alt={sneaker.name}
                title={sneaker.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-[#EF4444] font-semibold">{sneaker.category}</span>
                <span aria-hidden="true">·</span>
                <span>{sneaker.colorway}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  مقاسات {minSize}–{maxSize}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h2
                  id="pdp-title"
                  className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {sneaker.name}
                </h2>
                <div className="text-left shrink-0">
                  <span className="block text-xl font-bold text-white tabular-nums whitespace-nowrap">
                    {formatPrice(sneaker.price)}
                  </span>
                  {sneaker.originalPrice && (
                    <span className="block text-xs text-zinc-500 line-through tabular-nums whitespace-nowrap">
                      {formatPrice(sneaker.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {sneaker.savingsNote && (
                <p className="text-xs font-bold text-[#EF4444]">{sneaker.savingsNote}</p>
              )}

              <p className="text-sm text-zinc-300 leading-relaxed">{sneaker.description}</p>

              <dl className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div>
                  <dt className="text-zinc-500 mb-0.5">الخامة</dt>
                  <dd className="text-zinc-200 font-medium">{sneaker.material}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 mb-0.5">النعل</dt>
                  <dd className="text-zinc-200 font-medium">{sneaker.soleTech}</dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-zinc-800">
                {isBundle && sneaker.bundleItems ? (
                  <BundleSizeSelector
                    bundleItems={sneaker.bundleItems}
                    selectedBundleSizes={selectedBundleSizes}
                    onSelectPieceSize={handleBundlePieceSelect}
                    onApplyToAll={(size) => {
                      onApplyBundleSizeToAll(sneaker, size);
                      setSizeError(false);
                      setDirectOrderPreview(null);
                    }}
                    showError={sizeError}
                  />
                ) : (
                  <SizeSelector
                    availableSizes={sneaker.availableSizes}
                    selectedSize={selectedSize}
                    onSelectSize={handleSizeSelect}
                    showError={sizeError}
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-zinc-300">الكمية</span>
                <div className="inline-flex items-center border border-zinc-700 rounded-lg bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="إنقاص الكمية"
                    className="w-10 h-10 flex items-center justify-center text-zinc-200 hover:bg-zinc-800 rounded-r-lg cursor-pointer">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="زيادة الكمية"
                    className="w-10 h-10 flex items-center justify-center text-zinc-200 hover:bg-zinc-800 rounded-l-lg cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-300">
                <strong className="text-[#EF4444]">عرض خصم 50% على مصاريف الشحن لفترة محدودة:</strong>{' '}
                <strong className="text-white tabular-nums">50 ج.م</strong> لجميع المحافظات
                (بدلاً من <span className="line-through text-zinc-500 tabular-nums">100 ج.م</span>)
                · {DELIVERY_WINDOW_TEXT}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`h-12 px-5 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    addedFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                  }`}>
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>{isBundle ? 'تمت إضافة العرض' : `تمت الإضافة (مقاس ${selectedSize})`}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>أضف إلى السلة</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectOrder}
                  className="h-12 px-5 rounded-lg text-sm font-bold border border-zinc-600 bg-zinc-900 text-white hover:border-white hover:bg-zinc-800 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                  <MessageCircle className="w-4 h-4 text-[#EF4444]" aria-hidden="true" />
                  <span>اطلب مباشرة عبر واتساب</span>
                </button>
              </div>

              {directOrderPreview && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                    <span>ملخص الطلب السريع جاهز للإرسال</span>
                    <span className="text-[#EF4444] font-bold">{DELIVERY_WINDOW_TEXT}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-zinc-200 font-sans leading-relaxed bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    {directOrderPreview}
                  </pre>
                  <a
                    href={getWhatsAppHref(directOrderPreview)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors">
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>فتح واتساب وإرسال الطلب</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
