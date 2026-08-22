<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

/**
 * Single source of truth for every stock change.
 *
 * products.stock_quantity is a denormalized cache that is ONLY modified
 * through this service, always together with an inventory_movements row.
 */
class InventoryService
{
    /**
     * Register a new arrival: creates a batch + IN movement and increases stock.
     * Existing batches are never touched.
     */
    public function receive(Product $product, array $data, ?int $userId = null): InventoryBatch
    {
        return DB::transaction(function () use ($product, $data, $userId) {
            $quantity = (int) $data['quantity'];

            $batch = InventoryBatch::create([
                'product_id' => $product->id,
                'supplier_id' => $data['supplier_id'] ?? null,
                'batch_number' => $this->nextBatchNumber($product),
                'quantity_received' => $quantity,
                'quantity_remaining' => $quantity,
                'purchase_price' => $data['purchase_price'],
                'currency' => $data['currency'] ?? $product->currency,
                'arrival_date' => $data['arrival_date'] ?? now()->toDateString(),
                'supplier_invoice_number' => $data['supplier_invoice_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->recordMovement($product->id, $batch->id, 'IN', $quantity, InventoryBatch::class, $batch->id, 'Stock received', $userId);

            $product->increment('stock_quantity', $quantity);

            return $batch;
        });
    }

    /**
     * Deduct stock for a sale, consuming batches FIFO (oldest arrival first).
     * Creates one OUT movement per batch portion used.
     */
    public function sell(Product $product, int $quantity, ?string $referenceType = null, ?int $referenceId = null, string $reason = 'Sale', ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $quantity, $referenceType, $referenceId, $reason, $userId) {
            $product = Product::query()->whereKey($product->id)->lockForUpdate()->first();

            if ($product->stock_quantity < $quantity) {
                throw new InvalidArgumentException(
                    "Insufficient stock for {$product->name}. Available: {$product->stock_quantity}, requested: {$quantity}."
                );
            }

            $remaining = $quantity;

            $batches = InventoryBatch::query()
                ->where('product_id', $product->id)
                ->where('quantity_remaining', '>', 0)
                ->orderBy('arrival_date')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $take = min($remaining, $batch->quantity_remaining);
                $batch->decrement('quantity_remaining', $take);
                $this->recordMovement($product->id, $batch->id, 'OUT', -$take, $referenceType, $referenceId, $reason, $userId);
                $remaining -= $take;
            }

            if ($remaining > 0) {
                throw new InvalidArgumentException("Batch records for {$product->name} do not cover the sale quantity.");
            }

            $product->decrement('stock_quantity', $quantity);
        });
    }

    /**
     * Return stock (order cancelled / customer return). Refills FIFO batches
     * that still have free capacity so batch totals stay consistent.
     */
    public function restock(Product $product, int $quantity, ?string $referenceType = null, ?int $referenceId = null, string $reason = 'Returned to stock', ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $quantity, $referenceType, $referenceId, $reason, $userId) {
            $product = Product::query()->whereKey($product->id)->lockForUpdate()->first();

            $remaining = $quantity;
            $lastBatchId = null;

            $batches = InventoryBatch::query()
                ->where('product_id', $product->id)
                ->whereColumn('quantity_remaining', '<', 'quantity_received')
                ->orderBy('arrival_date')
                ->orderBy('id')
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }
                $space = $batch->quantity_received - $batch->quantity_remaining;
                $putBack = min($remaining, $space);
                if ($putBack > 0) {
                    $batch->increment('quantity_remaining', $putBack);
                    $lastBatchId = $batch->id;
                    $remaining -= $putBack;
                }
            }

            $this->recordMovement($product->id, $lastBatchId, 'RETURN', $quantity, $referenceType, $referenceId, $reason, $userId);

            $product->increment('stock_quantity', $quantity);
        });
    }

    /** Manual stock adjustment (positive or negative delta). */
    public function adjust(Product $product, int $delta, string $reason, ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $delta, $reason, $userId) {
            $type = $delta >= 0 ? 'ADJUSTMENT' : 'DAMAGED';

            $product->lockForUpdate();
            $product->increment('stock_quantity', $delta);

            $this->recordMovement($product->id, null, $type, $delta, null, null, $reason, $userId);
        });
    }

    private function recordMovement(int $productId, ?int $batchId, string $type, int $quantity, ?string $referenceType, ?int $referenceId, string $reason, ?int $userId): void
    {
        InventoryMovement::create([
            'product_id' => $productId,
            'batch_id' => $batchId,
            'type' => $type,
            'quantity' => $quantity,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'reason' => $reason,
            'created_by' => $userId,
        ]);
    }

    private function nextBatchNumber(Product $product): string
    {
        $count = InventoryBatch::query()->where('product_id', $product->id)->count() + 1;

        return sprintf('%s-B%03d', strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $product->sku), 0, 8)), $count);
    }
}
