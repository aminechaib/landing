<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private const METHODS = ['CASH', 'CARD', 'BANK_TRANSFER', 'COD', 'OTHER'];

    /** GET /api/admin/payments — ledger across all orders. */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()->with(['order.customer:id,first_name,last_name,phone', 'creator:id,name']);

        if ($q = trim((string) $request->input('search'))) {
            $query->where(function ($w) use ($q) {
                $w->where('reference', 'like', "%{$q}%")
                    ->orWhereHas('order', fn ($o) => $o
                        ->where('order_number', 'like', "%{$q}%")
                        ->orWhereHas('customer', fn ($c) => $c
                            ->where('first_name', 'like', "%{$q}%")
                            ->orWhere('last_name', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%")));
            });
        }

        if ($method = strtoupper((string) $request->input('method'))) {
            if (in_array($method, self::METHODS, true)) {
                $query->where('method', $method);
            }
        }

        if ($from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $summary = [
            'received' => (float) (clone $query)->sum('amount'),
            'count' => (clone $query)->count(),
        ];

        $payments = $query->latest()->paginate(min((int) $request->input('per_page', 25), 100));

        $payments->getCollection()->transform(fn ($p) => [
            'id' => $p->id,
            'amount' => (float) $p->amount,
            'method' => $p->method,
            'reference' => $p->reference,
            'currency' => $p->currency,
            'notes' => $p->notes,
            'created_by' => $p->creator?->name,
            'created_at' => $p->created_at->toIso8601String(),
            'customer_name' => $p->order?->customer
                ? $p->order->customer->first_name.' '.$p->order->customer->last_name
                : null,
            'order' => $p->order ? [
                'id' => $p->order->id,
                'order_number' => $p->order->order_number,
                'total' => (float) $p->order->total,
                'currency' => $p->order->currency,
                'payment_status' => $p->order->payment_status,
            ] : null,
        ]);

        return response()->json(['data' => $payments, 'summary' => $summary]);
    }

    /** PUT /api/admin/payments/{payment} — correct a mis-recorded payment. */
    public function update(Request $request, Payment $payment): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $payment->update([
            'amount' => round((float) $data['amount'], 2),
            'method' => $data['method'] ?? $payment->method,
            'reference' => $data['reference'] ?? null,
            'notes' => $data['notes'] ?? null,
            'updated_by' => $request->user()->id,
        ]);

        $this->syncPaymentStatus($payment->order);

        return response()->json(['message' => 'Payment updated.']);
    }

    /** DELETE /api/admin/payments/{payment} — soft-delete keeps an audit trail. */
    public function destroy(Request $request, Payment $payment): JsonResponse
    {
        $payment->update(['deleted_by' => $request->user()->id]);
        $payment->delete();

        $this->syncPaymentStatus($payment->order);

        return response()->json(['message' => 'Payment deleted.']);
    }

    /** Recompute the order's payment_status from its remaining (non-deleted) payments. */
    private function syncPaymentStatus(Order $order): void
    {
        $paid = (float) $order->payments()->sum('amount');

        $order->update([
            'payment_status' => $paid >= (float) $order->total - 0.005 ? 'PAID' : 'PENDING',
        ]);
    }
}
