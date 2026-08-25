<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

    /**
     * GET /api/orders/{orderNumber}/track?phone=XXX
     * Public endpoint — order number + phone verification.
     */
    public function track(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string']]);

        $phone = preg_replace('/[\s\-().]/', '', $request->input('phone'));

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['customer:id,first_name,last_name,phone,city', 'items:id,order_id,product_name,variant_name,quantity,unit_price,total,warranty_months'])
            ->first();

        if (! $order || preg_replace('/[\s\-().]/', '', $order->customer->phone) !== $phone) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'shipping_status' => $order->shipping_status,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'created_at' => $order->created_at->toIso8601String(),
            'customer' => [
                'name' => $order->customer->first_name . ' ' . $order->customer->last_name,
                'city' => $order->customer->city,
            ],
            'items' => $order->items->map(fn ($i) => [
                'product_name' => $i->product_name,
                'variant_name' => $i->variant_name,
                'quantity' => $i->quantity,
                'unit_price' => (float) $i->unit_price,
                'total' => (float) $i->total,
            ]),
        ]]);
    }

    /**
     * GET /api/orders/{orderNumber}/receipt?phone=XXX
     * Public endpoint — returns printable HTML receipt.
     */
    public function receipt(Request $request, string $orderNumber)
    {
        $request->validate(['phone' => ['required', 'string']]);

        $phone = preg_replace('/[\s\-().]/', '', $request->input('phone'));

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['customer:id,first_name,last_name,phone,address,city', 'items:id,order_id,product_name,variant_name,quantity,unit_price,total,warranty_months'])
            ->first();

        if (! $order || preg_replace('/[\s\-().]/', '', $order->customer->phone) !== $phone) {
            abort(404);
        }

        $customerName = $order->customer->first_name . ' ' . $order->customer->last_name;
        $date = $order->created_at->format('d M Y, h:i A');
        $items = $order->items;

        $html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Receipt ' . e($order->order_number) . '</title>';
        $html .= '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a;padding:40px;max-width:600px;margin:auto;font-size:14px}h1{font-size:20px;margin-bottom:4px}.sub{color:#666;font-size:13px;margin-bottom:24px}.section{border-top:1px solid #e5e5e5;padding-top:12px;margin-top:12px}.label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:8px}td{padding:6px 0;vertical-align:top}td:last-child{text-align:right;white-space:nowrap}.bold{font-weight:600}.total-row td{border-top:2px solid #1a1a1a;padding-top:8px;font-size:16px}.footer{margin-top:32px;text-align:center;color:#999;font-size:11px}@media print{body{padding:20px}}</style></head><body>';

        $html .= '<h1>Portage — Order Receipt</h1>';
        $html .= '<div class="sub">#' . e($order->order_number) . ' &middot; ' . e($date) . '</div>';

        $html .= '<div class="section"><div class="label">Customer</div>';
        $html .= '<div>' . e($customerName) . '</div>';
        if ($order->customer->address) {
            $html .= '<div>' . e($order->customer->address) . '</div>';
        }
        $html .= '<div>' . e($order->customer->city) . '</div>';
        $html .= '<div>' . e($order->customer->phone) . '</div></div>';

        $html .= '<div class="section"><div class="label">Items</div>';
        $html .= '<table>';
        foreach ($items as $item) {
            $name = e($item->product_name);
            if ($item->variant_name) {
                $name .= ' — ' . e($item->variant_name);
            }
            $html .= '<tr><td>' . $name . ' &times; ' . $item->quantity . '</td>';
            $html .= '<td>' . number_format((float) $item->total, 2) . ' ' . e($order->currency) . '</td></tr>';
        }
        $html .= '</table></div>';

        $html .= '<div class="section"><table>';
        $html .= '<tr><td>Subtotal</td><td>' . number_format((float) $order->subtotal, 2) . ' ' . e($order->currency) . '</td></tr>';
        if ((float) $order->discount > 0) {
            $html .= '<tr><td>Discount</td><td>−' . number_format((float) $order->discount, 2) . ' ' . e($order->currency) . '</td></tr>';
        }
        $shippingLabel = (float) $order->shipping_cost > 0 ? number_format((float) $order->shipping_cost, 2) . ' ' . e($order->currency) : 'FREE';
        $html .= '<tr><td>Shipping</td><td>' . $shippingLabel . '</td></tr>';
        $html .= '<tr class="total-row"><td class="bold">Total</td><td class="bold">' . number_format((float) $order->total, 2) . ' ' . e($order->currency) . '</td></tr>';
        $html .= '</table></div>';

        $html .= '<div class="section"><div class="label">Payment</div>';
        $html .= '<div>Cash on Delivery — ' . e($order->status) . '</div></div>';

        $html .= '<div class="footer">Thank you for your order!<br>Portage — Premium Electronics</div>';
        $html .= '</body></html>';

        return response($html)
            ->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Content-Disposition', 'inline; filename="receipt-' . $order->order_number . '.html"');
    }
}
