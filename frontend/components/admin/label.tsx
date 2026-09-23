"use client";

import { Barcode } from "@/components/admin/print";
import { formatMoney } from "@/lib/format";
import type { LabelConfig, LabelSections } from "@/lib/label";
import type { AdminOrderDetail } from "@/types";

/**
 * 2" × 3" shipping label — printed onto sticky label stock and stuck on the
 * delivery package. Sizing is in inches so it lines up with thermal labels.
 * Layout (sections, order, size, font) is driven by the admin label builder.
 */
export function ShippingLabel({
  order,
  store,
  config,
}: {
  order: AdminOrderDetail;
  store: { store_name: string | null; support_phone: string | null };
  config: LabelConfig;
}) {
  const items = order.items.slice(0, 3);
  const extra = order.items.length - items.length;

  const font = config.fontSize === "lg" ? "text-[11px]" : config.fontSize === "sm" ? "text-[8px]" : "text-[9px]";
  const headFont =
    config.fontSize === "lg" ? "text-xs" : config.fontSize === "sm" ? "text-[9px]" : "text-[10px]";

  const blocks: Record<LabelSections, React.ReactNode> = {
    store: (
      <div className="border-b border-zinc-800 pb-1 text-center">
        <p className={`${headFont} font-bold uppercase tracking-wide`}>
          {store.store_name ?? "Store"}
        </p>
        <p className="mt-0.5">{order.order_number}</p>
      </div>
    ),
    customer: (
      <div className="border-b border-zinc-800 py-1">
        <div className="flex items-center justify-between gap-1">
          <p className="max-w-24 truncate font-bold">{order.customer.name}</p>
          <p>{order.customer.phone}</p>
        </div>
        <p className="text-zinc-700">
          {[order.customer.address, order.customer.city].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    ),
    items: (
      <div className="border-b border-zinc-800 py-1">
        <p className="font-bold uppercase">Items</p>
        {items.map((item) => (
          <p key={item.id} className="truncate">
            {item.quantity}× {item.product_name}
            {item.variant_name ? ` (${item.variant_name})` : ""}
          </p>
        ))}
        {extra > 0 && <p>+{extra} more</p>}
      </div>
    ),
    barcode: (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <Barcode value={order.order_number} maxWidth={Math.max(60, config.width * 96 - 24)} />
        <p className="text-[7px]">{order.order_number}</p>
      </div>
    ),
    summary: (
      <div className="border-t border-zinc-800 pt-1">
        <p>{order.payment_method}</p>
        <p className="font-bold">Collect: {formatMoney(order.total, order.currency)}</p>
        <p className="text-zinc-700">{order.shipping_method ?? "Shipping"}</p>
      </div>
    ),
    support: (
      <div className="border-t border-zinc-800 pt-1 text-[7px] text-zinc-600">
        {store.support_phone ? `Support: ${store.support_phone}` : "Thank you"}
      </div>
    ),
  };

  return (
    <div
      className={`select-none overflow-hidden border border-zinc-800 px-1 py-1 font-mono text-zinc-900 ${font}`}
      style={{ width: `${config.width}in`, height: `${config.height}in`, lineHeight: 1.25 }}
    >
      <div className="flex h-full flex-col justify-between gap-1">
        {config.sections.map((section) => (
          <div key={section}>{blocks[section]}</div>
        ))}
      </div>
    </div>
  );
}