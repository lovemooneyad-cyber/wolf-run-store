import {useState} from 'react';
import {Check, Copy, MessageCircle, ShoppingBag, Trash2} from 'lucide-react';
import {EGYPT_GOVERNORATES} from '../data/sneakers';
import {CartItem, CustomerDetails} from '../types';
import {
  buildCartWhatsAppMessage,
  DELIVERY_WINDOW_TEXT,
  formatPrice,
  getDirectContactWhatsAppHref,
  getWhatsAppHref,
  SHIPPING_FEE,
  STORE_WHATSAPP_DISPLAY,
} from '../utils/orderFormatting';

interface OrderSummarySectionProps {
  items: CartItem[];
  customer: CustomerDetails;
  onUpdateCustomer: (patch: Partial<CustomerDetails>) => void;
  onRemoveItem: (itemKey: string) => void;
}

export function OrderSummarySection({
  items,
  customer,
  onUpdateCustomer,
  onRemoveItem,
}: OrderSummarySectionProps) {
  const [copied, setCopied] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.sneaker.price * item.quantity, 0);
  const totalWithShipping = subtotal + SHIPPING_FEE;
  const whatsAppMessage = buildCartWhatsAppMessage(items, customer);
  const whatsAppHref = getWhatsAppHref(whatsAppMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="order-summary"
      className="py-16 border-t border-zinc-800 bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#EF4444]">
              الخطوة الأخيرة للطلب · {DELIVERY_WINDOW_TEXT}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              ملخص الطلب ورسالة واتساب
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            يتم تمرير المقاس المختار بدقة من كل حذاء أو قطعة داخل العرض إلى السلة ورسالة
            الطلب النهائية مع حفظ اختياراتك تلقائياً.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-[#141418] p-10 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-zinc-500 mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">لم تُضف أي أحذية بعد</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              اختر مقاسك من أزرار المقاسات في أي بطاقة منتج أو عرض بالأعلى ثم اضغط على «أضف
              للسلة» ليظهر هنا ملخص الطلب الكامل ورسالة واتساب الجاهزة.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#catalog"
                className="inline-flex h-11 items-center justify-center px-6 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold transition-colors">
                العودة إلى الأحذية
              </a>
              <a
                href={getDirectContactWhatsAppHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 px-6 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold transition-colors">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>تواصل معنا واتساب ({STORE_WHATSAPP_DISPLAY})</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden bg-[#141418]">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-4 p-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">
                        {item.sneaker.name}
                      </div>
                      {item.sneaker.bundleItems && item.bundleSizes ? (
                        <div className="text-xs text-zinc-300 space-y-0.5">
                          {item.sneaker.bundleItems.map((piece) => (
                            <div key={piece.id}>
                              {piece.label}:{' '}
                              <strong className="text-[#EF4444] tabular-nums">
                                مقاس {item.bundleSizes![piece.id]}
                              </strong>
                            </div>
                          ))}
                          <div className="text-zinc-400 tabular-nums pt-0.5">
                            الكمية: {item.quantity}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>
                            المقاس المختار:{' '}
                            <strong className="text-[#EF4444] font-bold tabular-nums">
                              {item.size}
                            </strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">الكمية: {item.quantity}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {formatPrice(item.sneaker.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.key)}
                        aria-label={`إزالة ${item.sneaker.name}`}
                        className="text-zinc-500 hover:text-[#EF4444] p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-zinc-900/60 text-sm">
                  <span className="text-zinc-400">مجموع المنتجات</span>
                  <span className="font-semibold text-zinc-200 tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 p-4 bg-zinc-900/60 text-sm">
                  <span className="text-zinc-300">
                    الشحن لجميع المحافظات{' '}
                    <span className="text-[#EF4444] font-semibold">
                      (عرض خصم 50% لفترة محدودة)
                    </span>
                  </span>
                  <span className="font-semibold text-zinc-200 tabular-nums shrink-0">
                    <span className="line-through text-zinc-500 text-xs ml-2">100 ج.م</span>
                    {formatPrice(SHIPPING_FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900">
                  <span className="text-sm font-semibold text-zinc-200">
                    الإجمالي النهائي شامل الشحن ({DELIVERY_WINDOW_TEXT})
                  </span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={customer.name}
                  onChange={(e) => onUpdateCustomer({name: e.target.value})}
                  className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-[#141418] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626]"
                />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={customer.phone}
                  onChange={(e) => onUpdateCustomer({phone: e.target.value})}
                  className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-[#141418] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626] text-right"
                />
                <select
                  value={customer.governorate}
                  onChange={(e) => onUpdateCustomer({governorate: e.target.value})}
                  aria-label="اختيار المحافظة"
                  className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-[#141418] text-white text-sm focus:outline-none focus:border-[#DC2626]">
                  <option value="">اختر المحافظة</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="العنوان بالتفصيل"
                  value={customer.address}
                  onChange={(e) => onUpdateCustomer({address: e.target.value})}
                  className="h-11 px-3.5 rounded-lg border border-zinc-700 bg-[#141418] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626]"
                />
                <textarea
                  rows={2}
                  placeholder="ملاحظات إضافية (ميعاد التوصيل المفضل أو علامة مميزة)"
                  value={customer.notes}
                  onChange={(e) => onUpdateCustomer({notes: e.target.value})}
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-[#141418] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626] resize-none"
                />
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-[#141418] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">نص رسالة واتساب النهائية</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-[#EF4444] cursor-pointer">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="whitespace-pre-wrap text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-4 leading-relaxed font-sans">
                {whatsAppMessage}
              </pre>

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>إرسال الطلب عبر واتساب ({STORE_WHATSAPP_DISPLAY})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
