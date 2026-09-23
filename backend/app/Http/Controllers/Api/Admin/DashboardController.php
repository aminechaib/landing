<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /** GET /api/admin/stats */
    public function stats(): JsonResponse
    {
        $threshold = (int) config('shop.low_stock_threshold', 10);
        $today = now()->toDateString();

        return response()->json([
            'data' => [
                'total_products' => Product::query()->count(),
                'total_stock' => (int) Product::query()->sum('stock_quantity'),
                'low_stock' => Product::query()->whereBetween('stock_quantity', [1, $threshold])->count(),
                'out_of_stock' => Product::query()->where('stock_quantity', 0)->count(),
                'pending_orders' => Order::query()->where('status', 'PENDING')->count(),
                'todays_orders' => Order::query()->whereDate('created_at', $today)->count(),
                // Revenue is actual money: the sum of payments received today.
                // Negative payments (refunds — auto-written when a paid order is
                // cancelled or returned) reduce it.
                'todays_revenue' => (float) Payment::query()->whereDate('created_at', $today)->sum('amount'),
                'todays_refunds' => (float) Payment::query()->whereDate('created_at', $today)->where('amount', '<', 0)->sum('amount') * -1,
                'todays_returns' => OrderReturn::query()->whereDate('created_at', $today)->count(),
                'currency' => config('shop.currency'),
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
