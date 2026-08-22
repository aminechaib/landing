<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    /** GET /api/admin/orders */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with('customer:id,first_name,last_name,phone');

        if ($q = trim((string) $request->input('search'))) {
            $query->where(function ($w) use ($q) {
                $w->where('order_number', 'like', "%{$q}%")
                    ->orWhereHas('customer', fn ($c) => $c
                        ->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%"));
            });
        }

        if ($status = strtoupper((string) $request->input('status'))) {
            if (in_array($status, Order::STATUSES, true)) {
                $query->where('status', $status);
            }
        }

        if ($source = strtoupper((string) $request->input('source'))) {
            if (in_array($source, Order::SOURCES, true)) {
                $query->where('source', $source);
            }
        }

        if ($from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        $orders = $query->latest()->paginate(min((int) $request->input('per_page', 25), 100));

        $orders->getCollection()->transform(fn ($order) => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer->first_name . ' ' . $order->customer->last_name,
            'phone' => $order->customer->phone,
            'city' => $order->customer->city,
            'source' => $order->source,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'created_at' => $order->created_at->toIso8601String(),
        ]);

        return response()->json(['data' => $orders]);
    }

    /** GET /api/admin/orders/{order} */
    public function show(Order $order): JsonResponse
    {
        $order->load([
            'customer',
            'items.product:id,name,slug',
            'items.warranty:id,order_item_id,serial_number,warranty_months,start_date,end_date,status',
        ]);

        return response()->json(['data' => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'shipping_method' => $order->shipping_method,
            'shipping_status' => $order->shipping_status,
            'subtotal' => (float) $order->subtotal,
            'shipping_cost' => (float) $order->shipping_cost,
            'discount' => (float) $order->discount,
            'discount_code' => $order->discount_code,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'source' => $order->source,
            'utm' => array_filter([
                'utm_source' => $order->utm_source,
                'utm_medium' => $order->utm_medium,
                'utm_campaign' => $order->utm_campaign,
                'utm_content' => $order->utm_content,
                'utm_term' => $order->utm_term,
            ]),
            'customer_notes' => $order->customer_notes,
            'internal_notes' => $order->internal_notes,
            'created_at' => $order->created_at->toIso8601String(),
            'customer' => [
                'id' => $order->customer->id,
                'name' => $order->customer->first_name . ' ' . $order->customer->last_name,
                'phone' => $order->customer->phone,
                'email' => $order->customer->email,
                'address' => $order->customer->address,
                'city' => $order->customer->city,
            ],
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'variant_name' => $item->variant_name,
                'sku' => $item->sku,
                'product_slug' => $item->product?->slug,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
                'warranty_months' => $item->warranty_months,
                'warranty' => $item->warranty ? [
                    'serial_number' => $item->warranty->serial_number,
                    'start_date' => $item->warranty->start_date->toDateString(),
                    'end_date' => $item->warranty->end_date->toDateString(),
                    'status' => $item->warranty->end_date < today() && $item->warranty->status === 'ACTIVE'
                        ? 'EXPIRED' : $item->warranty->status,
                ] : null,
            ]),
        ]]);
    }

    /** PUT /api/admin/orders/{order} */
    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'internal_notes' => ['nullable', 'string', 'max:5000'],
            'payment_status' => ['nullable', 'in:PENDING,PAID,FAILED'],
            'shipping_status' => ['nullable', 'in:PENDING,PROCESSING,SHIPPED,DELIVERED,RETURNED'],
        ]);

        $order->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json(['message' => 'Order updated.']);
    }

    /** PUT /api/admin/orders/{order}/status */
    public function setStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:' . implode(',', Order::STATUSES)]]);

        $order = $this->orders->updateStatus($order, $data['status'], $request->user()->id);

        return response()->json([
            'message' => "Order {$order->order_number} set to {$order->status}.",
            'data' => ['status' => $order->status],
        ]);
    }
}
