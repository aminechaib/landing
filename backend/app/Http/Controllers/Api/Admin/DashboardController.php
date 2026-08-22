<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /** GET /api/admin/stats */
    public function stats(): JsonResponse
    {
        $threshold = (int) config('shop.low_stock_threshold', 10);

        $todayOrders = Order::query()->whereDate('created_at', today());

        return response()->json([
            'data' => [
                'total_products' => Product::query()->count(),
                'total_stock' => (int) Product::query()->sum('stock_quantity'),
                'low_stock' => Product::query()->whereBetween('stock_quantity', [1, $threshold])->count(),
                'out_of_stock' => Product::query()->where('stock_quantity', 0)->count(),
                'pending_orders' => Order::query()->where('status', 'PENDING')->count(),
                'todays_orders' => (clone $todayOrders)->count(),
                'todays_revenue' => (float) ((clone $todayOrders)
                    ->whereNotIn('status', ['CANCELLED'])
                    ->sum('total')),
            ],
        ]);
    }

    /** GET /api/admin/recent-orders */
    public function recentOrders(): JsonResponse
    {
        return response()->json([
            'data' => Order::query()
                ->with('customer:id,first_name,last_name')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn ($order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer->first_name . ' ' . $order->customer->last_name,
                    'phone' => $order->customer->phone,
                    'source' => $order->source,
                    'total' => (float) $order->total,
                    'currency' => $order->currency,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toIso8601String(),
                ]),
        ]);
    }
}
