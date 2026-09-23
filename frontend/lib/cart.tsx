"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";
import type { StoreSettings } from "@/types";

export type CartItem = {
  /** Stable identity: `${product_id}:${variant_id ?? 0}` */
  key: string;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  image: string | null;
  unit_price: number;
  currency: string;
  quantity: number;
  max_qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  settings: StoreSettings | null;
  cartOpen: boolean;
  checkoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "portage_cart";

const Ctx = createContext<CartContextValue | null>(null);

/**
 * Server-mirrored price computation shared by the cart sheet and checkout.
 * The backend recomputes everything authoritatively; this only previews totals.
 */
export function computeTotals(
  items: CartItem[],
  settings: StoreSettings | null,
  discountCode: string,
) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const promoCode = settings?.promo_code;
  const promoPercent = settings?.promo_percent ?? 0;
  const normalized = discountCode.trim().toUpperCase();
  const codeValid =
    normalized.length > 0 &&
    !!promoCode &&
    normalized === promoCode.toUpperCase() &&
    promoPercent > 0;
  const discount = codeValid ? Math.round(subtotal * promoPercent) / 100 : 0;

  const shippingCost = settings?.shipping_cost ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  return { subtotal, shippingCost, promoCode, promoPercent, discount, codeValid, total };
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted cart once
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    api<{ data: StoreSettings }>("/api/settings")
      .then((res) => setSettings(res.data))
      .catch(() => setSettings(null));
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const key = `${item.product_id}:${item.variant_id ?? 0}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(i.max_qty, i.quantity + quantity) }
              : i,
          );
        }
        return [
          ...prev,
          { ...item, key, quantity: Math.min(item.max_qty, quantity) },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback(
    (key: string) => setItems((prev) => prev.filter((i) => i.key !== key)),
    [],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key
          ? { ...i, quantity: Math.min(i.max_qty, Math.max(0, quantity)) }
          : i,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      settings,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [
      items,
      count,
      subtotal,
      settings,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addItem,
      removeItem,
      setQuantity,
      clear,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}