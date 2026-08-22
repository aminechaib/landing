<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    /** POST /api/orders — guest checkout, Cash on Delivery. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],

            'customer' => ['required', 'array'],
            'customer.first_name' => ['required', 'string', 'max:100'],
            'customer.last_name' => ['required', 'string', 'max:100'],
            'customer.phone' => ['required', 'string', 'min:6', 'max:30', 'regex:/^[0-9+\s\-().]+$/'],
            'customer.email' => ['nullable', 'email:filter', 'max:255'],
            'customer.address' => ['required', 'string', 'max:500'],
            'customer.city' => ['required', 'string', 'max:120'],

            'notes' => ['nullable', 'string', 'max:2000'],
            'discount_code' => ['nullable', 'string', 'max:50'],

            // Attribution (captured from landing URL by the frontend).
            'source' => ['nullable', 'string', 'in:' . implode(',', Order::SOURCES)],
            'utm_source' => ['nullable', 'string', 'max:120'],
            'utm_medium' => ['nullable', 'string', 'max:120'],
            'utm_campaign' => ['nullable', 'string', 'max:120'],
            'utm_content' => ['nullable', 'string', 'max:120'],
            'utm_term' => ['nullable', 'string', 'max:120'],
        ]);

        $order = $this->orders->create($data);

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => [
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'items' => $order->items->map(fn ($i) => [
                    'product_name' => $i->product_name,
                    'variant_name' => $i->variant_name,
                    'quantity' => $i->quantity,
                    'unit_price' => (float) $i->unit_price,
                    'total' => (float) $i->total,
                ]),
            ],
        ], Response::HTTP_CREATED);
    }
}
