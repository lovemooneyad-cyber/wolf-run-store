import {useState} from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {EGYPT_GOVERNORATES} from '../data/sneakers';
import {CartItem, CustomerDetails} from '../types';
import {
  buildCartWhatsAppMessage,
  DELIVERY_WINDOW_TEXT,
  formatItemSizesSummary,
  formatPrice,
  getWhatsAppHref,
  SHIPPING_FEE,
} from '../utils/orderFormatting';
import {SneakerImage} from './SneakerImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  customer: CustomerDetails;
  onUpdateCustomer: (patch: Partial<CustomerDetails>) => void;
  onUpdateQuantity: (itemKey: string, delta: number) => void;
  onRemoveItem: (itemKey: string) => void;
  onClearCart: () => void;
  onClose: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  customer,
  onUpdateCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onClose,
}: CartDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.sneaker.price * item.quantity, 0);
  const totalWithShipping = subtotal + SHIPPING_FEE;
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const whatsAppMessage = buildCartWhatsAppMessage(items, customer);
  const whatsAppHref = getWhatsAppHref(whatsAppMessage);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleConfirmOrder = () => {
    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.governorate.trim() ||
      !customer.address.trim()
    ) {
      setFormError('من فضلك أدخل الاسم ورقم الهاتف والمحافظة والعنوان لإتمام التأكيد.');
      return;
    }
    setFormError(null);
    const orderNum = `WR-${Math.floor(1040 + Math.random() * 900)}`;
    setConfirmedOrderId(orderNum);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="سلة التسوق"
      onClick={onClose}>
      <aside
        className="w-full max-w-lg bg-[#121216] text-zinc-100 h-full flex flex-col border-r border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#EF4444]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-white">سلة التسوق</h2>
            <span className="text-xs text-zinc-400 tabular-nums">({totalCount} قطعة)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق السلة"
            className="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200 hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedOrderId ? (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-6 space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  تم تأكيد الطلب {confirmedOrderId}
                </h3>
                <p className="text-sm text-zinc-300">
                  {DELIVERY_WINDOW_TEXT} إلى {customer.governorate} · للتواصل {customer.phone}
                </p>
              </div>
              <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-right text-xs space-y-2">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-200 block">
                        {item.sneaker.name} × {item.quantity}
                      </span>
                      <span className="text-[#EF4444] font-semibold block">
                        المقاس: {formatItemSizesSummary(item.sneaker, item.size, item.bundleSizes)}
                      </span>
                    </div>
                    <span className="tabular-nums font-bold text-white shrink-0">
                      {formatPrice(item.sneaker.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-zinc-400">
                  <span>الشحن لجميع المحافظات (خصم 50% لفترة محدودة)</span>
                  <span className="tabular-nums font-semibold text-zinc-200 shrink-0">
                    {formatPrice(SHIPPING_FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-white">
                  <span>الإجمالي شامل الشحن</span>
                  <span className="tabular-nums text-[#EF4444]">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال نسخة على واتساب</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrderId(null);
                    onClearCart();
                    onClose();
                  }}
                  className="h-11 px-4 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm font-semibold hover:bg-zinc-800 cursor-pointer">
                  إنهاء
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">سلة التسوق فارغة حالياً</h3>
                <p className="text-sm text-zinc-400">
                  اختر الكوتشي أو العرض المناسب وحدد مقاسك لإضافته إلى السلة.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-6 rounded-lg bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer">
                تصفح الأحذية والعروض
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3.5 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/70">
                    <div className="w-20 aspect-[4/5] rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                      <SneakerImage
                        src={item.sneaker.image}
                        alt={item.sneaker.name}
                        title={item.sneaker.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-sm font-bold text-white truncate">
                            {item.sneaker.name}
                          </h3>
                          {item.sneaker.bundleItems && item.bundleSizes ? (
                            <ul className="text-[11px] text-zinc-300 space-y-0.5">
                              {item.sneaker.bundleItems.map((piece) => (
                                <li key={piece.id}>
                                  {piece.label}:{' '}
                                  <strong className="text-[#EF4444] tabular-nums">
                                    مقاس {item.bundleSizes![piece.id]}
                                  </strong>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-zinc-400">
                              المقاس المختار:{' '}
                              <strong className="text-[#EF4444] font-bold tabular-nums">
                                {item.size}
                              </strong>
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`حذف ${item.sneaker.name}`}
                          className="text-zinc-500 hover:text-[#EF4444] p-1 cursor-pointer shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-zinc-700 bg-zinc-950 rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.key, -1)}
                            aria-label="إنقاص الكمية"
                            className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:bg-zinc-800 cursor-pointer">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.key, 1)}
                            aria-label="زيادة الكمية"
                            className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:bg-zinc-800 cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatPrice(item.sneaker.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">بيانات التوصيل</h3>
                  <span className="text-[11px] font-semibold text-[#EF4444]">
                    {DELIVERY_WINDOW_TEXT}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="الاسم الكامل *"
                    value={customer.name}
                    onChange={(e) => {
                      onUpdateCustomer({name: e.target.value});
                      setFormError(null);
                    }}
                    className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626]"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف *"
                    value={customer.phone}
                    onChange={(e) => {
                      onUpdateCustomer({phone: e.target.value});
                      setFormError(null);
                    }}
                    className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626] text-right"
                  />
                </div>
                <select
                  value={customer.governorate}
                  onChange={(e) => {
                    onUpdateCustomer({governorate: e.target.value});
                    setFormError(null);
                  }}
                  aria-label="اختيار المحافظة"
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm focus:outline-none focus:border-[#DC2626]">
                  <option value="">اختر المحافظة *</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="العنوان بالتفصيل (الحي، الشارع، رقم العمارة) *"
                  value={customer.address}
                  onChange={(e) => {
                    onUpdateCustomer({address: e.target.value});
                    setFormError(null);
                  }}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626]"
                />
                <textarea
                  rows={2}
                  placeholder="ملاحظات إضافية (ميعاد التوصيل المفضل أو علامة مميزة)"
                  value={customer.notes}
                  onChange={(e) => onUpdateCustomer({notes: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626] resize-none"
                />
                {formError && (
                  <p className="text-xs font-semibold text-[#EF4444]">{formError}</p>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-300">معاينة رسالة واتساب</h3>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-[#EF4444] cursor-pointer">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الملخص</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-3 leading-relaxed font-sans max-h-40 overflow-y-auto">
                  {whatsAppMessage}
                </pre>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && !confirmedOrderId && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-950 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>مجموع المنتجات</span>
                <span className="tabular-nums font-semibold text-zinc-200">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                <span>الشحن لجميع المحافظات (عرض خصم 50% لفترة محدودة)</span>
                <span className="tabular-nums font-semibold text-zinc-200 shrink-0">
                  <span className="line-through text-zinc-500 ml-1.5">100 ج.م</span>
                  {formatPrice(SHIPPING_FEE)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800">
                <span className="text-zinc-200 font-semibold">الإجمالي شامل الشحن</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {formatPrice(totalWithShipping)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>إتمام عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="h-11 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                <span>تأكيد الطلب (COD)</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
