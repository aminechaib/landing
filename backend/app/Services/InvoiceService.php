<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    /**
     * Sequential invoice number for the current year: INV-2026-0001, INV-2026-0002, …
     * Computed under a row lock so two admins can't issue the same number.
     */
    public function nextNumber(): string
    {
        $prefix = 'INV-'.now()->year.'-';

        return DB::transaction(function () use ($prefix) {
            $last = Invoice::query()
                ->where('invoice_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->max('invoice_number');

            $next = $last ? ((int) Str::afterLast($last, '-')) + 1 : 1;

            return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        });
    }

    /** One invoice per order: issue it, or return the already-issued one. */
    public function forOrder(Order $order, User $user): Invoice
    {
        if ($order->invoice) {
            return $order->invoice;
        }

        return DB::transaction(function () use ($order, $user) {
            return Invoice::create([
                'invoice_number' => $this->nextNumber(),
                'order_id' => $order->id,
                'status' => 'ISSUED',
                'total' => $order->total,
                'currency' => $order->currency,
                'issued_by' => $user->id,
                'issued_at' => now(),
            ]);
        });
    }
}
