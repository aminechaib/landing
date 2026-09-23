<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoices) {}

    /** GET /api/admin/invoices */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::query()->with(['order.customer:id,first_name,last_name,phone', 'issuer:id,name']);

        if ($q = trim((string) $request->input('search'))) {
            $query->where(function ($w) use ($q) {
                $w->where('invoice_number', 'like', "%{$q}%")
                    ->orWhereHas('order', fn ($o) => $o
                        ->where('order_number', 'like', "%{$q}%")
                        ->orWhereHas('customer', fn ($c) => $c
                            ->where('first_name', 'like', "%{$q}%")
                            ->orWhere('last_name', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%")));
            });
        }

        if ($status = strtoupper((string) $request->input('status'))) {
            if (in_array($status, ['ISSUED', 'CANCELLED'], true)) {
                $query->where('status', $status);
            }
        }

        $invoices = $query->latest()->paginate(min((int) $request->input('per_page', 25), 100));

        $invoices->getCollection()->transform(fn ($invoice) => [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'status' => $invoice->status,
            'total' => (float) $invoice->total,
            'currency' => $invoice->currency,
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'order_number' => $invoice->order?->order_number,
            'order_id' => $invoice->order?->id,
            'customer_name' => $invoice->order?->customer
                ? $invoice->order->customer->first_name.' '.$invoice->order->customer->last_name
                : null,
        ]);

        return response()->json(['data' => $invoices]);
    }

    /** GET /api/admin/invoices/{invoice} — full printable document data. */
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json(['data' => $this->document($invoice)]);
    }

    /** GET /api/admin/orders/{order}/invoice */
    public function forOrder(Order $order): JsonResponse
    {
        return $order->invoice
            ? response()->json(['data' => $this->document($order->invoice)])
            : response()->json(['message' => 'No invoice issued for this order yet.'], 404);
    }

    private function document(Invoice $invoice): array
    {
        $invoice->load(['order.customer', 'order.items', 'order.payments', 'issuer:id,name']);

        $order = $invoice->order;
        $paidTotal = (float) $order->payments->sum('amount');

        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'status' => $invoice->status,
            'total' => (float) $invoice->total,
            'currency' => $invoice->currency,
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'issuer' => $invoice->issuer?->name,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'created_at' => $order->created_at->toIso8601String(),
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'shipping_status' => $order->shipping_status,
                'subtotal' => (float) $order->subtotal,
                'shipping_cost' => (float) $order->shipping_cost,
                'discount' => (float) $order->discount,
                'discount_code' => $order->discount_code,
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'customer' => [
                    'name' => $order->customer->first_name.' '.$order->customer->last_name,
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
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total' => (float) $item->total,
                ])->values(),
            ],
            'payments' => $order->payments->sortBy('created_at')->values()->map(fn ($p) => [
                'id' => $p->id,
                'amount' => (float) $p->amount,
                'method' => $p->method,
                'reference' => $p->reference,
                'notes' => $p->notes,
                'created_by' => $p->creator?->name,
                'created_at' => $p->created_at->toIso8601String(),
            ]),
            'paid_total' => round($paidTotal, 2),
            'balance_due' => round(max(0, $paidTotal - (float) $order->total), 2),
        ];
    }

    /** POST /api/admin/orders/{order}/invoice — issue an invoice for an order. */
    public function store(Request $request, Order $order): JsonResponse
    {
        $invoice = $this->invoices->forOrder($order, $request->user());

        return response()->json([
            'message' => 'Invoice issued.',
            'data' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $invoice->status,
            ],
        ], 201);
    }

    /** PUT /api/admin/invoices/{invoice}/status */
    public function setStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:ISSUED,CANCELLED']]);

        $invoice->update([
            'status' => $data['status'],
            'cancelled_at' => $data['status'] === 'CANCELLED' ? now() : null,
        ]);

        return response()->json(['message' => "Invoice {$invoice->invoice_number} set to {$invoice->status}."]);
    }
}
