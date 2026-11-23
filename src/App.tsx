import {useEffect, useMemo, useState} from 'react';
import {
  ArrowDownLeft,
  Award,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import {CartDrawer} from './components/CartDrawer';
import {OrderSummarySection} from './components/OrderSummarySection';
import {ProductCard} from './components/ProductCard';
import {ProductDetailsModal} from './components/ProductDetailsModal';
import {HERO_IMAGE, SNEAKERS, STORE_LOGO} from './data/sneakers';
import {
  CartItem,
  CustomerDetails,
  PriceSortOrder,
  Sneaker,
  SneakerCategory,
  SneakerSize,
} from './types';
import {
  buildCartItemKey,
  DELIVERY_WINDOW_TEXT,
  getDirectContactWhatsAppHref,
  STORE_WHATSAPP_DISPLAY,
} from './utils/orderFormatting';

const CATEGORIES: SneakerCategory[] = ['الكل', 'كوتشيات فردي', 'العروض والباقات'];

const STORAGE_KEYS = {
  cart: 'wolf_run_cart_v1',
  customer: 'wolf_run_customer_v1',
  sizes: 'wolf_run_sizes_v1',
  bundleSizes: 'wolf_run_bundle_sizes_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<SneakerCategory>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<PriceSortOrder>('default');

  const [selectedSizes, setSelectedSizes] = useState<Record<string, SneakerSize | null>>(() =>
    readStorage(STORAGE_KEYS.sizes, {})
  );
  const [selectedBundleSizes, setSelectedBundleSizes] = useState<
    Record<string, Record<string, SneakerSize | null>>
  >(() => readStorage(STORAGE_KEYS.bundleSizes, {}));

  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.cart, []));
  const [customer, setCustomer] = useState<CustomerDetails>(() =>
    readStorage(STORAGE_KEYS.customer, {
      name: '',
      phone: '',
      governorate: '',
      address: '',
      notes: '',
    })
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailsSneaker, setActiveDetailsSneaker] = useState<Sneaker | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // Ignore storage quota / private mode failures
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(customer));
    } catch {
      // Ignore storage failures
    }
  }, [customer]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.sizes, JSON.stringify(selectedSizes));
    } catch {
      // Ignore storage failures
    }
  }, [selectedSizes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.bundleSizes,
        JSON.stringify(selectedBundleSizes)
      );
    } catch {
      // Ignore storage failures
    }
  }, [selectedBundleSizes]);

  const filterAndSort = (items: Sneaker[]): Sneaker[] => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.arabicTagline.toLowerCase().includes(query) ||
            item.colorway.toLowerCase().includes(query) ||
            String(item.price).includes(query)
        )
      : items;

    if (priceSort === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (priceSort === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  };

  const individualSneakers = useMemo(
    () => filterAndSort(SNEAKERS.filter((item) => item.category === 'كوتشيات فردي')),
    [searchQuery, priceSort]
  );

  const bundleOffers = useMemo(
    () => filterAndSort(SNEAKERS.filter((item) => item.category === 'العروض والباقات')),
    [searchQuery, priceSort]
  );

  const totalVisibleCount =
    (activeCategory === 'الكل' || activeCategory === 'كوتشيات فردي'
      ? individualSneakers.length
      : 0) +
    (activeCategory === 'الكل' || activeCategory === 'العروض والباقات'
      ? bundleOffers.length
      : 0);

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleSelectSize = (sneakerId: string, size: SneakerSize) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sneakerId]: size,
    }));
  };

  const handleSelectBundlePieceSize = (
    sneakerId: string,
    pieceId: string,
    size: SneakerSize
  ) => {
    setSelectedBundleSizes((prev) => ({
      ...prev,
      [sneakerId]: {
        ...(prev[sneakerId] ?? {}),
        [pieceId]: size,
      },
    }));
  };

  const handleApplyBundleSizeToAll = (sneaker: Sneaker, size: SneakerSize) => {
    if (!sneaker.bundleItems) return;
    const allMap: Record<string, SneakerSize> = {};
    sneaker.bundleItems.forEach((piece) => {
      allMap[piece.id] = size;
    });
    setSelectedBundleSizes((prev) => ({
      ...prev,
      [sneaker.id]: allMap,
    }));
  };

  const handleAddToCart = (
    sneaker: Sneaker,
    size: SneakerSize,
    quantity = 1,
    bundleSizes?: Record<string, SneakerSize>
  ) => {
    const key = buildCartItemKey(sneaker.id, size, bundleSizes);
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? {...item, quantity: item.quantity + quantity} : item
        );
      }
      return [...prev, {key, sneaker, size, bundleSizes, quantity}];
    });
  };

  const handleUpdateQuantity = (itemKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === itemKey ? {...item, quantity: item.quantity + delta} : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemKey: string) => {
    setCart((prev) => prev.filter((item) => item.key !== itemKey));
  };

  const handleUpdateCustomer = (patch: Partial<CustomerDetails>) => {
    setCustomer((prev) => ({...prev, ...patch}));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-zinc-100">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#hero"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight font-display whitespace-nowrap shrink-0">
            <img
              src={STORE_LOGO}
              alt="شعار WOLF RUN"
              className="w-9 h-9 rounded-lg object-cover border border-zinc-800 shrink-0"
            />
            <span>
              <span className="text-white">WOLF </span>
              <span className="text-[#DC2626]">RUN</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <a
              href="#hero"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              الرئيسية
            </a>
            <a
              href="#catalog"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              الكوتشيات الفردي
            </a>
            <a
              href="#offers-section"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              العروض والباقات
            </a>
            <a
              href="#order-summary"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              ملخص الطلب
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="h-10 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>سلة التسوق</span>
            <span className="tabular-nums font-bold">({totalCartItems})</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="bg-black border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold text-[#EF4444] tracking-wide">
                WOLF RUN STORE · عرض خصم 50% على مصاريف الشحن لفترة محدودة (50 ج.م) ·{' '}
                {DELIVERY_WINDOW_TEXT}
              </p>

              <h1
                className="font-bold text-white leading-[1.2] tracking-tight"
                style={{fontSize: 'clamp(2rem, 3.6vw, 3.25rem)', textWrap: 'balance'}}>
                أحذية ترند بأسعار تبدأ من 260 جنيه في{' '}
                <span className="font-display text-[#DC2626]">WOLF RUN</span>
              </h1>

              <p className="text-base text-zinc-300 leading-relaxed max-w-xl">
                اطلب كل كوتشي لوحده (سامبا 400ج · تشامبيون 350ج · نايك جملي 400ج · باندا أسود 280ج
                · باندا أبيض 260ج) أو اختر من عروض التوفير مع تحديد مقاس كل كوتشي بضغطة زر.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalog"
                  className="h-12 px-6 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap">
                  <span>تصفح الكوتشيات والعروض</span>
                  <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href={getDirectContactWhatsAppHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>تواصل معنا واتساب ({STORE_WHATSAPP_DISPLAY})</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              <div className="rounded-2xl border border-zinc-800 bg-black p-4 flex items-center justify-center">
                <img
                  src={STORE_LOGO}
                  alt="شعار متجر WOLF RUN للأحذية الرياضية"
                  className="w-full max-w-[280px] aspect-square object-contain rounded-xl"
                />
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center">
                <img
                  src={HERO_IMAGE}
                  alt="كوتشي سامبا WOLF RUN بسعر 400 جنيه"
                  className="w-full h-full max-h-[340px] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="catalog" className="py-16 bg-[#09090B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#EF4444]">
                  تشكيلة WOLF RUN · اختيار سريع للمقاس
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  الكوتشيات الفردية والعروض
                </h2>
              </div>

              <div
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl self-start lg:self-auto"
                role="tablist"
                aria-label="تصفية المنتجات">
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#DC2626] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}>
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search
                  className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كوتشي أو عرض (مثل: سامبا، باندا، تشامبيون، موكا)..."
                  aria-label="بحث في المنتجات"
                  className="w-full h-11 pr-10 pl-10 rounded-xl border border-zinc-800 bg-[#141418] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#DC2626]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="مسح البحث"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4">
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as PriceSortOrder)}
                  aria-label="ترتيب حسب السعر"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-800 bg-[#141418] text-zinc-200 text-sm focus:outline-none focus:border-[#DC2626] cursor-pointer">
                  <option value="default">الترتيب: الافتراضي</option>
                  <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
                  <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
                </select>
              </div>
            </div>

            {totalVisibleCount === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-[#141418] p-10 text-center space-y-3">
                <p className="text-base font-bold text-white">
                  لا توجد نتائج مطابقة للبحث «{searchQuery}»
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('الكل');
                    setPriceSort('default');
                  }}
                  className="h-10 px-5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold cursor-pointer">
                  إعادة عرض جميع الكوتشيات
                </button>
              </div>
            )}

            {(activeCategory === 'الكل' || activeCategory === 'كوتشيات فردي') &&
              individualSneakers.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        الكوتشيات الفردية (كل كوتشي لوحده)
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        السامبا وتشامبيون ونايك جملي مقاسات 41–45 · الباندا الأسود والأبيض مقاسات
                        42–46
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400 tabular-nums shrink-0">
                      {individualSneakers.length} موديلات
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {individualSneakers.map((sneaker) => (
                      <ProductCard
                        key={sneaker.id}
                        sneaker={sneaker}
                        selectedSize={selectedSizes[sneaker.id] ?? null}
                        selectedBundleSizes={selectedBundleSizes[sneaker.id] ?? {}}
                        onSelectSize={handleSelectSize}
                        onSelectBundlePieceSize={handleSelectBundlePieceSize}
                        onApplyBundleSizeToAll={handleApplyBundleSizeToAll}
                        onAddToCart={handleAddToCart}
                        onOpenDetails={(item) => setActiveDetailsSneaker(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

            {(activeCategory === 'الكل' || activeCategory === 'العروض والباقات') &&
              bundleOffers.length > 0 && (
                <div id="offers-section" className="space-y-6 pt-4">
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">العروض والباقات الخاصة</h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        يمكنك تحديد مقاس كل كوتشي داخل العرض بشكل مستقل (من 41 إلى 45)
                      </p>
                    </div>
                    <span className="text-xs text-[#EF4444] font-semibold tabular-nums shrink-0">
                      {bundleOffers.length} عروض توفير
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {bundleOffers.map((sneaker) => (
                      <ProductCard
                        key={sneaker.id}
                        sneaker={sneaker}
                        selectedSize={selectedSizes[sneaker.id] ?? null}
                        selectedBundleSizes={selectedBundleSizes[sneaker.id] ?? {}}
                        onSelectSize={handleSelectSize}
                        onSelectBundlePieceSize={handleSelectBundlePieceSize}
                        onApplyBundleSizeToAll={handleApplyBundleSizeToAll}
                        onAddToCart={handleAddToCart}
                        onOpenDetails={(item) => setActiveDetailsSneaker(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>

        <section id="store-guarantees" className="py-12 border-t border-zinc-800 bg-[#121216]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 text-[#EF4444] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  عرض خصم 50% على مصاريف الشحن لفترة محدودة
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  الشحن لجميع المحافظات بسعر{' '}
                  <span className="text-white font-semibold tabular-nums">50 ج.م</span> فقط
                  بدلاً من{' '}
                  <span className="line-through text-zinc-500 tabular-nums">100 ج.م</span> ·{' '}
                  <strong className="text-zinc-200">{DELIVERY_WINDOW_TEXT}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 text-[#EF4444] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">دفع آمن ومعاينة قبل الاستلام</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  افحص الحذاء وتأكد من مطابقة المقاس المختار والخامة قبل الدفع عند الاستلام.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 text-[#EF4444] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">جودة ممتازة ومقاسات مضمونة</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  اختيار مستقل لكل قطعة داخل العروض (41–45) مع حفظ سلتك تلقائياً لضمان وصول
                  المقاس الصحيح.
                </p>
              </div>
            </div>
          </div>
        </section>

        <OrderSummarySection
          items={cart}
          customer={customer}
          onUpdateCustomer={handleUpdateCustomer}
          onRemoveItem={handleRemoveItem}
        />
      </main>

      <footer className="border-t border-zinc-800 bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <img
              src={STORE_LOGO}
              alt="WOLF RUN"
              className="w-7 h-7 rounded object-cover border border-zinc-800"
            />
            <span className="font-display font-bold text-white">
              WOLF <span className="text-[#DC2626]">RUN</span> STORE
            </span>
          </div>
          <a
            href={getDirectContactWhatsAppHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors whitespace-nowrap">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>تواصل معنا واتساب: {STORE_WHATSAPP_DISPLAY}</span>
          </a>
          <p>© 2026 WOLF RUN STORE. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      <ProductDetailsModal
        sneaker={activeDetailsSneaker}
        selectedSize={
          activeDetailsSneaker ? (selectedSizes[activeDetailsSneaker.id] ?? null) : null
        }
        selectedBundleSizes={
          activeDetailsSneaker ? (selectedBundleSizes[activeDetailsSneaker.id] ?? {}) : {}
        }
        onSelectSize={handleSelectSize}
        onSelectBundlePieceSize={handleSelectBundlePieceSize}
        onApplyBundleSizeToAll={handleApplyBundleSizeToAll}
        onAddToCart={handleAddToCart}
        onClose={() => setActiveDetailsSneaker(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        customer={customer}
        onUpdateCustomer={handleUpdateCustomer}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
