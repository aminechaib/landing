<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

class OrderService
{
    public function __construct(private readonly InventoryService $inventory)
    {
    }

    /**
     * Guest checkout. Runs in one transaction:
     * validate -> price server-side -> create customer/order/items.
     *
     * Never trusts prices or stock coming from the client.
     *
     * No stock is taken here. Quantities are only pulled from the shelves at
     * confirmation time (see updateStatus), so pending orders hold no stock.
     */
    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $items = collect($data['items']);

            $products = Product::query()
                ->whereIn('id', $items->pluck('product_id')->unique())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $errors = [];
            foreach ($items as $index => $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    $errors["items.{$index}.product_id"] = 'Product not found.';
                    continue;
                }
                if ($product->status !== 'ACTIVE') {
                    $errors["items.{$index}.product_id"] = "{$product->name} is not available for ordering.";
                    continue;
                }
                if ($product->stock_quantity < (int) $item['quantity']) {
                    $errors["items.{$index}.quantity"] = "Only {$product->stock_quantity} unit(s) of {$product->name} left in stock.";
                }
            }

            if (! empty($errors)) {
                validation_error($errors);
            }

            // Resolve variants and compute server-side pricing.
            $lines = [];
            $subtotal = 0;

            foreach ($items as $item) {
                /** @var Product $product */
                $product = $products[$item['product_id']];
                $variant = null;

                if (! empty($item['variant_id'])) {
                    $variant = $product->variants()->whereKey($item['variant_id'])->first();
                    if (! $variant) {
                        validation_error(["items.variant_id" => 'Selected variant is not available.']);
                    }
                }

                $unitPrice = (float) ($variant?->price ?? $product->selling_price);
                $lineTotal = round($unitPrice * (int) $item['quantity'], 2);
                $subtotal += $lineTotal;

                $lines[] = compact('product', 'variant', 'unitPrice', 'lineTotal') + ['quantity' => (int) $item['quantity']];
            }

            $subtotal = round($subtotal, 2);

            [$discount, $discountCode] = $this->resolveDiscount($data['discount_code'] ?? null, $subtotal);

            $shippingCost = (float) Setting::get('shipping_cost', '0');
            $total = round(max(0, $subtotal - $discount) + $shippingCost, 2);

            $customer = Customer::query()->firstOrCreate(
                ['phone' => preg_replace('/[\s\-().]/', '', $data['customer']['phone'])],
                [
                    'first_name' => trim($data['customer']['first_name']),
                    'last_name' => trim($data['customer']['last_name'] ?? ''),
                    'email' => $data['customer']['email'] ?? null,
                    'address' => $data['customer']['address'] ?? null,
                    'city' => $data['customer']['city'] ?? null,
                ],
            );

            $order = Order::create([
                'order_number' => 'PENDING',
                'customer_id' => $customer->id,
                'status' => Order::STATUSES[0],
                'payment_method' => 'COD',
                'payment_status' => 'PENDING',
                'shipping_method' => 'STANDARD',
                'shipping_status' => 'PENDING',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => $total,
                'currency' => $products->first()?->currency ?? config('shop.currency'),
                'source' => $data['source'] ?? 'DIRECT',
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
                'utm_content' => $data['utm_content'] ?? null,
                'utm_term' => $data['utm_term'] ?? null,
                'discount_code' => $discountCode,
                'customer_notes' => $data['notes'] ?? null,
            ]);

            $order->forceFill(['order_number' => sprintf('ORD-%d', 1000 + $order->id)])->save();

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'product_variant_id' => $line['variant']?->id,
                    'product_name' => $line['product']->name,
                    'variant_name' => $line['variant']?->name,
                    'sku' => $line['variant']?->sku ?? $line['product']->sku,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unitPrice'],
                    'discount' => 0,
                    'total' => $line['lineTotal'],
                    'warranty_months' => $line['product']->warranty_months,
                ]);
            }

            return $order->fresh(['items']);
        });
    }

    /**
     * Status transition handling:
     *  - CONFIRMED pulls the ordered quantities from stock (FIFO, one OUT
     *    movement per product) and creates warranties.
     *  - CANCELLED / RETURNED give the stock back, exactly once, but only if
     *    the order had actually been confirmed (nothing was taken at placement,
     *    and legacy pre-change orders are detected by their OUT movements).
     */
    public function updateStatus(Order $order, string $status, ?int $userId = null): Order
    {
        if (! in_array($status, Order::STATUSES, true)) {
            validation_error(['status' => 'Invalid order status.']);
        }

        DB::transaction(function () use ($order, $status, $userId) {
            $previous = $order->status;

            if ($previous === $status) {
                return;
            }

            $order->status = $status;

            if ($status === 'CONFIRMED') {
                // Take the stock only now. Orders placed while stock is short
                // fail here with a clear error instead of overcommitting.
                try {
                    $this->sellOrderStock($order, $userId);
                } catch (InvalidArgumentException $e) {
                    validation_error(['status' => $e->getMessage()]);
                }

                $this->createWarranties($order);
            }

            if ($status === 'SHIPPED') {
                $order->shipping_status = 'SHIPPED';
            }

            if ($status === 'DELIVERED') {
                $order->payment_status = 'PAID';
                $order->shipping_status = 'DELIVERED';
                $this->settleCodOnDelivery($order, $userId);
            }

            // Stock returns to the shelves when an order that already took stock
            // is cancelled, or goods physically come back after delivery.
            if ($status === 'CANCELLED' && $this->stockTaken($order, $previous)) {
                $this->restockOrder($order, "Order {$order->order_number} cancelled", $userId);
            } elseif ($status === 'RETURNED') {
                // Whole-order return. Always records the return and lets the
                // recordReturn() movement math decide how much stock — if any —
                // actually comes back (an order that never left the shelves
                // restocks nothing; a delivered order comes back exactly once).
                $this->recordReturn($order, "Order {$order->order_number} returned", $userId);
                $order->shipping_status = 'RETURNED';
                $this->voidWarranties($order);
            }

            // Money that was already received has to be returned.
            if ($status === 'CANCELLED') {
                $this->refundPayments($order, "Refund — order {$order->order_number} cancelled", $userId);
            } elseif ($status === 'RETURNED') {
                $this->refundPayments($order, "Refund — order {$order->order_number} returned", $userId);
            }

            $order->save();
        });

        return $order->fresh(['items']);
    }

    private function restockOrder(Order $order, string $reason, ?int $userId): void
    {
        foreach ($order->items as $item) {
            if ($item->product_id) {
                $this->inventory->restock(
                    $item->product,
                    $item->quantity,
                    Order::class,
                    $order->id,
                    $reason,
                    $userId,
                );
            }
        }
    }

    /**
     * Whole-order return: create (or reuse) the returns record and send the
     * items back to the shelves. Restore quantities are derived from the
     * inventory ledger — only stock that was actually taken and has not been
     * returned yet comes back, so the transition is safe no matter what
     * status the order was in before, and repeats stay a no-op.
     */
    private function recordReturn(Order $order, string $reason, ?int $userId): void
    {
        $return = OrderReturn::query()->where('order_id', $order->id)->first();

        if (! $return) {
            $return = OrderReturn::create([
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'status' => 'COMPLETED',
                'reason' => $reason,
                'notes' => 'Auto-created when the order was marked RETURNED.',
            ]);
        }

        // Stock actually pulled from the shelves for this order (FIFO OUT movements).
        $taken = InventoryMovement::query()
            ->where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->where('type', 'OUT')
            ->selectRaw('product_id, ABS(SUM(quantity)) AS qty')
            ->groupBy('product_id')
            ->pluck('qty', 'product_id');

        // ...minus stock already handed back (an earlier cancellation or return).
        $returned = InventoryMovement::query()
            ->where('type', 'RETURN')
            ->where(function ($query) use ($order) {
                $query->where(function ($q) use ($order) {
                    $q->where('reference_type', Order::class)->where('reference_id', $order->id);
                })->orWhere(function ($q) use ($order) {
                    $q->where('reference_type', OrderReturn::class)->whereIn(
                        'reference_id',
                        OrderReturn::query()->where('order_id', $order->id)->pluck('id'),
                    );
                });
            })
            ->selectRaw('product_id, SUM(quantity) AS qty')
            ->groupBy('product_id')
            ->pluck('qty', 'product_id');

        $leftToReturn = $taken->map(fn ($qty, $productId) => (int) $qty - (int) ($returned[$productId] ?? 0));

        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            $available = min($item->quantity, max(0, (int) ($leftToReturn[$item->product_id] ?? 0)));
            $leftToReturn[$item->product_id] = max(0, (int) ($leftToReturn[$item->product_id] ?? 0) - $available);

            if ($available <= 0) {
                continue;
            }

            if ($line = $return->items()->firstWhere('order_item_id', $item->id)) {
                $line->update(['quantity' => $line->quantity + $available, 'restocked' => true]);
            } else {
                $return->items()->create([
                    'order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $available,
                    'condition' => 'NEW',
                    'action' => 'RESTOCK',
                    'restocked' => true,
                ]);
            }

            $this->inventory->restock($item->product, $available, OrderReturn::class, $return->id, $reason, $userId);
        }
    }

    /** Returned goods no longer carry an active warranty. */
    private function voidWarranties(Order $order): void
    {
        \App\Models\Warranty::query()
            ->where('order_id', $order->id)
            ->where('status', 'ACTIVE')
            ->update(['status' => 'VOID']);
    }

    /**
     * Cash-on-delivery settlement: when an order is delivered, whatever has
     * not been paid yet is received at the door and recorded as a payment.
     * This is what makes "revenue today" reflect real money received.
     */
    private function settleCodOnDelivery(Order $order, ?int $userId): void
    {
        if ($order->payments()->where('method', 'REFUND')->exists()) {
            return;
        }

        $paid = (float) $order->payments()->sum('amount');
        $remaining = round((float) $order->total - $paid, 2);

        if ($remaining > 0) {
            $order->payments()->create([
                'amount' => $remaining,
                'method' => 'COD',
                'currency' => $order->currency,
                'notes' => 'Auto — payment settled on delivery.',
                'created_by' => $userId,
            ]);
        }
    }

    /**
     * Reverse already-recorded money when an order is cancelled or returned.
     * Writes a single negative payment (REFUND) so the money ledger and the
     * dashboard revenue — which is a sum of payments — drop accordingly.
     */
    private function refundPayments(Order $order, string $reason, ?int $userId): void
    {
        if ($order->payments()->where('method', 'REFUND')->exists()) {
            return;
        }

        $paid = (float) $order->payments()->sum('amount');
        if ($paid <= 0) {
            return;
        }

        $order->payments()->create([
            'amount' => -$paid,
            'method' => 'REFUND',
            'reference' => 'Refund',
            'currency' => $order->currency,
            'notes' => $reason,
            'created_by' => $userId,
        ]);

        $order->update(['payment_status' => 'REFUNDED']);
    }

    /**
     * Whether the shelves were actually depleted for this order.
     * True for any order that reached CONFIRMED or later, or (for orders
     * created before the confirm-time-deduction change) that still carry an
     * OUT movement.
     */
    private function stockTaken(Order $order, string $previous): bool
    {
        if (in_array($previous, ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'], true)) {
            return true;
        }

        return InventoryMovement::query()
            ->where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->where('type', 'OUT')
            ->exists();
    }

    /** Pull each ordered line from stock (FIFO via InventoryService). */
    private function sellOrderStock(Order $order, ?int $userId): void
    {
        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            $this->inventory->sell(
                $item->product,
                $item->quantity,
                Order::class,
                $order->id,
                "Confirmed order {$order->order_number}",
                $userId,
            );
        }
    }

    private function createWarranties(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->warranty_months <= 0 || $item->warranty()->exists()) {
                continue;
            }

            $start = now();

            \App\Models\Warranty::create([
                'order_id' => $order->id,
                'order_item_id' => $item->id,
                'product_id' => $item->product_id,
                'warranty_months' => $item->warranty_months,
                'start_date' => $start->toDateString(),
                'end_date' => $start->copy()->addMonths($item->warranty_months)->toDateString(),
                'status' => 'ACTIVE',
            ]);
        }
    }

    /**
     * @return array{0: float, 1: ?string}
     */
    private function resolveDiscount(?string $code, float $subtotal): array
    {
        if (empty($code)) {
            return [0.0, null];
        }

        $validCode = Setting::get('promo_code');
        $percent = (float) Setting::get('promo_percent', '0');

        if (! $validCode || strtoupper(trim($code)) !== strtoupper($validCode) || $percent <= 0) {
            validation_error(['discount_code' => 'The discount code is not valid.']);
        }

        return [round($subtotal * $percent / 100, 2), strtoupper(trim($code))];
    }
}
