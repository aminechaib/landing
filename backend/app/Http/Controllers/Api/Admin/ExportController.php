<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\InventoryBatch;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Warranty;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    private const EXPORTS = [
        'orders' => 'orders',
        'products' => 'products',
        'inventory' => 'inventory_batches',
        'customers' => 'customers',
        'price-history' => 'product_prices',
        'movements' => 'inventory_movements',
        'warranties' => 'warranties',
        'returns' => 'returns',
        'newsletter-subscribers' => 'newsletter_subscribers',
    ];

    /** GET /api/admin/export/{type}?format=csv */
    public function export(string $type): StreamedResponse
    {
        if (! isset(self::EXPORTS[$type])) {
            abort(404, "Unknown export type '{$type}'.");
        }

        $filename = str_replace('-', '_', $type) . '_' . now()->toDateString() . '.csv';

        return response()->streamDownload(function () use ($type) {
            $out = fopen('php://output', 'w');

            foreach ($this->rowsFor($type) as $index => $row) {
                if ($index === 0) {
                    fputcsv($out, array_keys($row));
                }
                fputcsv($out, $row);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function rowsFor(string $type): \Generator
    {
        yield from match ($type) {
            'orders' => $this->query(Order::class, function (\Illuminate\Database\Eloquent\Builder $q) {
                $q->with('customer:id,first_name,last_name,phone,city')
                    ->orderBy('id')
                    ->select(['id', 'order_number', 'customer_id', 'status', 'payment_method', 'payment_status',
                        'shipping_status', 'subtotal', 'shipping_cost', 'discount', 'total', 'currency',
                        'source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
                        'created_at']);
            }, fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer' => optional($o->customer)->first_name . ' ' . optional($o->customer)->last_name,
                'phone' => optional($o->customer)->phone,
                'city' => optional($o->customer)->city,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'payment_status' => $o->payment_status,
                'shipping_status' => $o->shipping_status,
                'subtotal' => $o->subtotal,
                'shipping_cost' => $o->shipping_cost,
                'discount' => $o->discount,
                'total' => $o->total,
                'currency' => $o->currency,
                'source' => $o->source,
                'utm_source' => $o->utm_source,
                'utm_medium' => $o->utm_medium,
                'utm_campaign' => $o->utm_campaign,
                'utm_content' => $o->utm_content,
                'utm_term' => $o->utm_term,
                'created_at' => $o->created_at?->toDateTimeString(),
            ]),
            'products' => $this->query(Product::class, function (Builder $q) {
                $q->withTrashed()
                    ->with('category:id,name')->with('brand:id,name')
                    ->select(['id', 'sku', 'barcode', 'name', 'category_id', 'brand_id',
                        'selling_price', 'currency', 'stock_quantity', 'warranty_months', 'status', 'badge', 'created_at', 'deleted_at']);
            }, fn (Product $p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'barcode' => $p->barcode,
                'name' => $p->name,
                'category' => $p->category?->name,
                'brand' => $p->brand?->name,
                'selling_price' => $p->selling_price,
                'currency' => $p->currency,
                'stock_quantity' => $p->stock_quantity,
                'warranty_months' => $p->warranty_months,
                'status' => $p->status,
                'badge' => $p->badge,
                'created_at' => $p->created_at?->toDateTimeString(),
                'deleted_at' => $p->deleted_at?->toDateTimeString(),
            ]),
            'inventory' => $this->query(InventoryBatch::class, function (Builder $q) {
                $q->with('product:id,name,sku')->with('supplier:id,name')
                    ->orderBy('arrival_date');
            }, fn (InventoryBatch $b) => [
                'id' => $b->id,
                'batch_number' => $b->batch_number,
                'product_sku' => $b->product?->sku,
                'product_name' => $b->product?->name,
                'supplier' => $b->supplier?->name,
                'quantity_received' => $b->quantity_received,
                'quantity_remaining' => $b->quantity_remaining,
                'purchase_price' => $b->purchase_price,
                'currency' => $b->currency,
                'arrival_date' => $b->arrival_date?->toDateString(),
                'invoice_number' => $b->supplier_invoice_number,
            ]),
            'customers' => $this->query(Customer::class, null, fn (Customer $c) => [
                'id' => $c->id,
                'first_name' => $c->first_name,
                'last_name' => $c->last_name,
                'phone' => $c->phone,
                'email' => $c->email,
                'address' => $c->address,
                'city' => $c->city,
                'country' => $c->country,
                'orders_count' => $c->orders()->count(),
                'total_spent' => $c->orders()->whereNotIn('status', ['CANCELLED'])->sum('total'),
                'notes' => $c->notes,
                'created_at' => $c->created_at?->toDateTimeString(),
            ]),
            'price-history' => $this->query(ProductPrice::class, function (Builder $q) {
                $q->with('product:id,name,sku')->orderBy('valid_from');
            }, fn (ProductPrice $p) => [
                'id' => $p->id,
                'product_sku' => $p->product?->sku,
                'product_name' => $p->product?->name,
                'price' => $p->price,
                'currency' => $p->currency,
                'valid_from' => $p->valid_from?->toDateTimeString(),
                'valid_to' => $p->valid_to?->toDateTimeString(),
                'reason' => $p->reason,
            ]),
            'movements' => $this->query(InventoryMovement::class, function (Builder $q) {
                $q->with('product:id,name,sku')->with('batch:id,batch_number')->latest();
            }, fn (InventoryMovement $m) => [
                'id' => $m->id,
                'date' => $m->created_at?->toDateTimeString(),
                'product_sku' => $m->product?->sku,
                'product_name' => $m->product?->name,
                'batch_number' => $m->batch?->batch_number,
                'type' => $m->type,
                'quantity' => $m->quantity,
                'reference_type' => $m->reference_type,
                'reference_id' => $m->reference_id,
                'reason' => $m->reason,
            ]),
            'warranties' => $this->query(Warranty::class, function (Builder $q) {
                $q->with('item:id,product_name')->with('order:id,order_number');
            }, fn (Warranty $w) => [
                'id' => $w->id,
                'order_number' => $w->order?->order_number,
                'product_name' => $w->item?->product_name,
                'serial_number' => $w->serial_number,
                'warranty_months' => $w->warranty_months,
                'start_date' => $w->start_date?->toDateString(),
                'end_date' => $w->end_date?->toDateString(),
                'status' => $w->status,
            ]),
            'returns' => $this->query(OrderReturn::class, function (Builder $q) {
                $q->with('order:id,order_number')->with('customer:id,first_name,last_name');
            }, fn (OrderReturn $r) => [
                'id' => $r->id,
                'order_number' => $r->order?->order_number,
                'customer' => optional($r->customer)->first_name . ' ' . optional($r->customer)->last_name,
                'status' => $r->status,
                'reason' => $r->reason,
                'items_count' => $r->items()->count(),
                'created_at' => $r->created_at?->toDateTimeString(),
            ]),
            'newsletter-subscribers' => $this->query(
                \App\Models\NewsletterSubscriber::class,
                null,
                fn (\App\Models\NewsletterSubscriber $s) => [
                    'id' => $s->id,
                    'email' => $s->email,
                    'subscribed_at' => $s->created_at?->toDateTimeString(),
                ],
            ),
        };
    }

    /**
     * @param  callable(Builder): void|null  $scope
     * @param  callable(Model): array<string,mixed>  $map
     */
    private function query(string $modelClass, ?callable $scope, callable $map): \Generator
    {
        $q = $modelClass::query();
        if ($scope) {
            $scope($q);
        }

        foreach ($q->orderBy('id')->cursor() as $row) {
            yield $map($row);
        }
    }
}
