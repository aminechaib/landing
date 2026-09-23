"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Render an arbitrary document (shipping label, invoice) through the browser's
 * print dialog while hiding everything else on screen. Mounts the content in a
 * portal, flags <body class="printing">, waits for the DOM to settle, then
 * calls window.print(). After the dialog closes the overlay is torn down.
 */
export function usePrint() {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [armed, setArmed] = useState(false);
  const afterPrintRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!armed) return;

    document.body.classList.add("printing");

    const trigger = window.setTimeout(() => window.print(), 80);

    const done = () => {
      window.clearTimeout(trigger);
      afterPrintRef.current?.();
      afterPrintRef.current = null;
      setContent(null);
      setArmed(false);
      document.body.classList.remove("printing");
    };

    window.addEventListener("afterprint", done);
    const fallback = window.setTimeout(done, 60000);

    return () => {
      window.clearTimeout(trigger);
      window.clearTimeout(fallback);
      window.removeEventListener("afterprint", done);
      document.body.classList.remove("printing");
    };
  }, [armed]);

  const portal =
    armed && typeof document !== "undefined"
      ? createPortal(<div className="print-root">{content}</div>, document.body)
      : null;

  return {
    print: (node: React.ReactNode, onAfterPrint?: () => void) => {
      afterPrintRef.current = onAfterPrint ?? null;
      setContent(node);
      setArmed(true);
    },
    portal,
  };
}

/**
 * Renders a scannable Code 128 barcode for the value using JsBarcode.
 * The bar module width is picked so the code always fits within `maxWidth`
 * pixels (label width minus padding) — real barcodes are only scannable when
 * not clipped. The human-readable value is printed underneath by the caller.
 */
export function Barcode({
  value,
  className,
  maxWidth,
}: {
  value: string;
  className?: string;
  maxWidth: number;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Code 128: ~11 modules per character + start/check/stop overhead.
    const modules = Math.max(30, value.length * 11 + 34);
    const width = Math.max(1, Math.min(2.4, Math.floor((maxWidth - 16) / modules)));

    JsBarcode(el, value, {
      format: "CODE128",
      displayValue: false,
      width,
      height: 28,
      margin: 4,
    });
  }, [value, maxWidth]);

  return <svg ref={ref} className={className} />;
}