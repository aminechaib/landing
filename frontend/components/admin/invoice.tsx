"use client";

import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { InvoiceDetail } from "@/types";

/**
 * A4 invoice document. Rendered via usePrint() so only this sheet reaches the
 * printer — the admin console chrome is suppressed during the print.
 */
export function InvoiceDocument({
  invoice,
  store,
}: {
  invoice: InvoiceDetail;
  store: {
    store_name?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
  };
}) {
  const order = invoice.order;
  const paidTotal = Number(invoice.paid_total) || 0;
  const balance = Number(invoice.balance_due) || 0;

  return (
    <div className="mx-auto w-[7in] max-w-full bg-white px-4 py-6 font-sans text-zinc-900">
      <header className="flex items-start justify-between border-b border-zinc-800 pb-4">
        <div>
          <p className="text-lg font-bold">{store.store_name ?? "Store"}</p>
          {store.support_phone && <p className="text-xs text-zinc-600">{store.support_phone}</p>}
          {store.support_email && <p className="text-xs text-zinc-600">{store.support_email}</p>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-wide">INVOICE</p>
          <p className="font-mono text-sm">{invoice.invoice_number}</p>
          <p className="text-xs text-zinc-600">
            {invoice.issued_at ? formatDate(invoice.issued_at) : "—"} · {invoice.status}
          </p>
        </div>
      </header>

      <div className="flex items-start justify-between py-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Billed to</p>
          <p className="mt-1 font-medium">{order.customer.name}</p>
          <p className="text-zinc-700">{order.customer.phone}</p>
          {order.customer.email && <p className="text-zinc-700">{order.customer.email}</p>}
          <p className="whitespace-pre-line text-zinc-700">
            {[order.customer.address, order.customer.city].filter(Boolean).join("\n") || "—"}
          </p>
        </div>
        <div className="text-right text-xs text-zinc-600">
          <p>
            Order: <span className="font-mono">{order.order_number}</span>
          </p>
          <p>Placed: {formatDateTime(order.created_at)}</p>
          <p>Status: {order.status}</p>
          <p>Payment: {order.payment_method} · {order.payment_status}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-zinc-800 text-left uppercase tracking-wide text-zinc-500">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-200">
              <td className="py-2">
                {item.product_name}
                {item.variant_name && <p className="text-zinc-500">{item.variant_name}</p>}
                {item.sku && <p className="font-mono text-zinc-500">{item.sku}</p>}
              </td>
              <td className="py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">{formatMoney(item.unit_price, order.currency)}</td>
              <td className="py-2 text-right tabular-nums font-medium">{formatMoney(item.total, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-3 w-56 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-700">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-zinc-700">
          <span>Shipping</span>
          <span className="tabular-nums">{formatMoney(order.shipping_cost, order.currency)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-zinc-700">
            <span>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</span>
            <span className="tabular-nums">−{formatMoney(order.discount, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-zinc-800 pt-1 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(order.total, order.currency)}</span>
        </div>
        <div className="flex justify-between text-zinc-700">
          <span>Paid</span>
          <span className="tabular-nums">{formatMoney(paidTotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Balance due</span>
          <span className="tabular-nums">{formatMoney(balance, invoice.currency)}</span>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Payments</p>
          <table className="w-full border-collapse text-xs">
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id} className="text-zinc-700">
                  <td className="py-1 tabular-nums">{formatDateTime(p.created_at)}</td>
                  <td className="py-1">{p.method}{p.reference ? ` · ${p.reference}` : ""}</td>
                  <td className="py-1 text-right tabular-nums">{formatMoney(p.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-8 pt-2 text-center text-xs text-zinc-500">
        {invoice.issuer ? `Issued by ${invoice.issuer}` : "Thank you for your order."}
      </footer>
    </div>
  );
}