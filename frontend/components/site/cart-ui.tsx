"use client";

import { CartSheet } from "@/components/site/cart-sheet";
import { CheckoutDialog } from "@/components/site/checkout-dialog";

/** Global cart + checkout overlays. Mount inside <CartProvider>. */
export function CartUI() {
  return (
    <>
      <CartSheet />
      <CheckoutDialog />
    </>
  );
}