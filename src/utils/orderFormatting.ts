import {CartItem, CustomerDetails, Sneaker, SneakerSize} from '../types';

export const STORE_WHATSAPP_NUMBER = '201551763372';
export const STORE_WHATSAPP_DISPLAY = '01551763372';
export const SHIPPING_FEE = 50;
export const DELIVERY_WINDOW_TEXT = 'التوصيل خلال 2 إلى 3 أيام';

export function getDirectContactWhatsAppHref(): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'السلام عليكم، أود الاستفسار عن كوتشيات وعروض متجر WOLF RUN.'
  )}`;
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-US')} ج.م`;
}

export function formatItemSizesSummary(
  sneaker: Sneaker,
  size: SneakerSize,
  bundleSizes?: Record<string, SneakerSize>
): string {
  if (sneaker.bundleItems && bundleSizes) {
    return sneaker.bundleItems
      .map((piece) => `${piece.label}: ${bundleSizes[piece.id] ?? size}`)
      .join(' | ');
  }
  return `${size}`;
}

export function buildCartItemKey(
  sneakerId: string,
  size: SneakerSize,
  bundleSizes?: Record<string, SneakerSize>
): string {
  if (bundleSizes && Object.keys(bundleSizes).length > 0) {
    const serialized = Object.keys(bundleSizes)
      .sort()
      .map((k) => `${k}=${bundleSizes[k]}`)
      .join(',');
    return `${sneakerId}::${serialized}`;
  }
  return `${sneakerId}::${size}`;
}

export function buildCartWhatsAppMessage(items: CartItem[], customer: CustomerDetails): string {
  const subtotal = items.reduce((sum, item) => sum + item.sneaker.price * item.quantity, 0);
  const totalWithShipping = subtotal + SHIPPING_FEE;

  const lines: string[] = [
    'طلب جديد من متجر WOLF RUN',
    '──────────────────────',
    'المنتجات المطلوبة:',
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.sneaker.name}`);
    if (item.sneaker.bundleItems && item.bundleSizes) {
      lines.push('   • المقاسات المختارة داخل العرض:');
      item.sneaker.bundleItems.forEach((piece) => {
        lines.push(`     - ${piece.label}: مقاس ${item.bundleSizes![piece.id]}`);
      });
    } else {
      lines.push(`   • المقاس المختار: ${item.size}`);
    }
    lines.push(
      `   • الكمية: ${item.quantity}`,
      `   • السعر: ${formatPrice(item.sneaker.price * item.quantity)}`
    );
  });

  lines.push(
    '──────────────────────',
    `مجموع المنتجات: ${formatPrice(subtotal)}`,
    `الشحن لجميع المحافظات (عرض خصم 50% لفترة محدودة): ${formatPrice(SHIPPING_FEE)}`,
    `الإجمالي الكلي شامل الشحن: ${formatPrice(totalWithShipping)}`,
    `${DELIVERY_WINDOW_TEXT} · الدفع عند الاستلام`,
    '──────────────────────',
    'بيانات العميل:',
    `• الاسم: ${customer.name.trim() || 'غير محدد'}`,
    `• الهاتف: ${customer.phone.trim() || 'غير محدد'}`,
    `• المحافظة: ${customer.governorate.trim() || 'غير محدد'}`,
    `• العنوان: ${customer.address.trim() || 'غير محدد'}`
  );

  if (customer.notes.trim()) {
    lines.push(`• ملاحظات: ${customer.notes.trim()}`);
  }

  return lines.join('\n');
}

export function buildDirectOrderWhatsAppMessage(
  sneaker: Sneaker,
  size: SneakerSize,
  quantity: number,
  bundleSizes?: Record<string, SneakerSize>
): string {
  const subtotal = sneaker.price * quantity;
  const totalWithShipping = subtotal + SHIPPING_FEE;

  const lines: string[] = [
    'طلب مباشر من متجر WOLF RUN',
    '──────────────────────',
    `• المنتج / العرض: ${sneaker.name}`,
    `• المواصفات: ${sneaker.colorway}`,
  ];

  if (sneaker.bundleItems && bundleSizes) {
    lines.push('• المقاسات المختارة داخل العرض:');
    sneaker.bundleItems.forEach((piece) => {
      lines.push(`  - ${piece.label}: مقاس ${bundleSizes[piece.id] ?? size}`);
    });
  } else {
    lines.push(`• المقاس المختار: ${size}`);
  }

  lines.push(
    `• الكمية: ${quantity}`,
    `• السعر: ${formatPrice(subtotal)}`,
    `• الشحن لجميع المحافظات (عرض خصم 50% لفترة محدودة): ${formatPrice(SHIPPING_FEE)}`,
    `• الإجمالي شامل الشحن: ${formatPrice(totalWithShipping)}`,
    `• مدة التوصيل: ${DELIVERY_WINDOW_TEXT}`,
    '──────────────────────',
    'أرجو تأكيد التوفر وتفاصيل التوصيل.'
  );

  return lines.join('\n');
}

export function getWhatsAppHref(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
