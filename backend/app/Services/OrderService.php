<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
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
     * validate -> price server-side -> create customer/order/items ->
     * deduct stock with movements -> commit.
     *
     * Never trusts prices or stock coming from the client.
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
                    'last_name' => trim($data['customer']['last_name']),
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

                $this->inventory->sell(
                    $line['product'],
                    $line['quantity'],
                    Order::class,
                    $order->id,
                    "Sale — order {$order->order_number}",
                );
            }

            return $order->fresh(['items']);
        });
    }

    /**
     * Status transition handling: confirmations create warranties, cancellations
     * and returns restore stock exactly once.
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
                $this->createWarranties($order);
            }

            if ($status === 'SHIPPED') {
                $order->shipping_status = 'SHIPPED';
            }

            if ($status === 'DELIVERED') {
                $order->payment_status = 'PAID';
                $order->shipping_status = 'DELIVERED';
            }

            // Stock returns to the shelves when an unshipped order is cancelled
            // or goods physically come back.
            $wasOpen = ! in_array($previous, ['CANCELLED', 'RETURNED'], true);

            if ($status === 'CANCELLED' && in_array($previous, ['PENDING', 'CONFIRMED', 'PROCESSING'], true)) {
                $this->restockOrder($order, "Order {$order->order_number} cancelled", $userId);
            } elseif ($status === 'RETURNED' && $wasOpen && $order->shipping_status === 'DELIVERED') {
                $this->restockOrder($order, "Order {$order->order_number} returned", $userId);
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
